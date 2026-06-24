import axios, { AxiosInstance, AxiosError } from "axios";
import { authenticateViaBrowser, type ServiceNowCredentials } from "./auth.js";

export interface ServiceNowConfig {
  instanceUrl: string;
  sessionCookie: string;
  userToken: string;
}

export interface SNQueryParams {
  table: string;
  query?: string;
  fields?: string;
  limit?: number;
  offset?: number;
}

export class ServiceNowClient {
  private http: AxiosInstance;
  private instanceUrl: string;
  private reauthInProgress: Promise<void> | null = null;

  constructor(config: ServiceNowConfig) {
    this.instanceUrl = config.instanceUrl;
    this.http = this.buildHttp(config.sessionCookie, config.userToken);
  }

  private buildHttp(sessionCookie: string, userToken: string): AxiosInstance {
    return axios.create({
      baseURL: `${this.instanceUrl}/api/now`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: sessionCookie,
        "X-UserToken": userToken,
      },
    });
  }

  /**
   * Updates the HTTP client with fresh credentials.
   */
  updateCredentials(creds: ServiceNowCredentials): void {
    this.http = this.buildHttp(creds.sessionCookie, creds.userToken);
    process.stderr.write("[servicenow-mcp] Credentials refreshed successfully.\n");
  }

  /**
   * Re-authenticates via browser. Only one reauth runs at a time —
   * concurrent callers wait for the same promise.
   */
  private async reauthenticate(): Promise<void> {
    if (this.reauthInProgress) {
      return this.reauthInProgress;
    }

    this.reauthInProgress = (async () => {
      process.stderr.write(
        "[servicenow-mcp] Session expired. Opening browser for re-authentication...\n"
      );
      try {
        const creds = await authenticateViaBrowser(this.instanceUrl);
        this.updateCredentials(creds);
      } finally {
        this.reauthInProgress = null;
      }
    })();

    return this.reauthInProgress;
  }

  /**
   * Wraps an HTTP call with automatic retry on 401/403.
   */
  private async withAutoReauth<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      const axErr = err as AxiosError;
      if (axErr.response && [401, 403].includes(axErr.response.status)) {
        await this.reauthenticate();
        return fn(); // retry once with fresh creds
      }
      throw err;
    }
  }

  async getRecords(params: SNQueryParams) {
    const { table, query, fields, limit = 10, offset = 0 } = params;
    const queryParams: Record<string, string> = {
      sysparm_limit: String(limit),
      sysparm_offset: String(offset),
    };
    if (query) queryParams.sysparm_query = query;
    if (fields) queryParams.sysparm_fields = fields;

    return this.withAutoReauth(async () => {
      const res = await this.http.get(`/table/${table}`, { params: queryParams });
      return res.data.result;
    });
  }

  async getRecord(table: string, sysId: string) {
    return this.withAutoReauth(async () => {
      const res = await this.http.get(`/table/${table}/${sysId}`);
      return res.data.result;
    });
  }

  async createRecord(table: string, data: Record<string, unknown>) {
    return this.withAutoReauth(async () => {
      const res = await this.http.post(`/table/${table}`, data);
      return res.data.result;
    });
  }

  async updateRecord(table: string, sysId: string, data: Record<string, unknown>) {
    return this.withAutoReauth(async () => {
      const res = await this.http.patch(`/table/${table}/${sysId}`, data);
      return res.data.result;
    });
  }

  /**
   * Fetches journal entries (comments and/or work_notes) for a record
   * using sys_history_line, which is where this ServiceNow instance
   * stores the full journal history.
   * 
   * Deduplicates by journal_sysid to avoid repeated entries across
   * multiple history sets.
   *
   * @param sysId - The sys_id of the parent record
   * @param element - "comments", "work_notes", or "all" for both
   * @param limit - Max entries to return (default 50)
   */
  async getJournalEntries(
    sysId: string,
    element: "comments" | "work_notes" | "all" = "all",
    limit: number = 50
  ) {
    let query = `set.id=${sysId}`;
    if (element !== "all") {
      query += `^field=${element}`;
    } else {
      query += `^fieldINcomments,work_notes`;
    }
    query += "^ORDERBYupdate_time";

    return this.withAutoReauth(async () => {
      // Fetch more than needed to account for duplicates across history sets
      const fetchLimit = limit * 4;
      const res = await this.http.get(`/table/sys_history_line`, {
        params: {
          sysparm_query: query,
          sysparm_fields: "field,new,user_name,user_id,update_time,journal_sysid,label",
          sysparm_limit: String(fetchLimit),
        },
      });

      const raw: Array<Record<string, string>> = res.data.result ?? [];

      // Deduplicate by journal_sysid (same entry appears in multiple history sets)
      const seen = new Set<string>();
      const unique: Array<Record<string, string>> = [];
      for (const entry of raw) {
        const key = entry.journal_sysid || entry.sys_id;
        if (key && seen.has(key)) continue;
        if (key) seen.add(key);
        unique.push(entry);
      }

      // Return only the requested limit, mapped to a cleaner shape
      return unique.slice(0, limit).map((e) => ({
        type: e.field,
        text: e.new,
        author: e.user_name,
        author_id: e.user_id,
        timestamp: e.update_time,
      }));
    });
  }
}

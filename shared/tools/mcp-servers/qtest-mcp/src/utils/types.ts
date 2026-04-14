// qTest API response types

export interface QtestProject {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

export interface QtestTestStep {
  description: string;
  expected: string;
  order: number;
}

export interface QtestTestCase {
  id: number;
  name: string;
  description: string;
  precondition: string;
  test_steps: QtestTestStep[];
  parent_id: number;
  pid: string;
  web_url: string;
}

export interface QtestTestRun {
  id: number;
  name: string;
  test_case: { id: number; name: string };
  status: string;
  assigned_to: string;
  parent_id: number;
}

export interface QtestTestRunResult {
  status: "passed" | "failed" | "blocked" | "incomplete";
  note?: string;
  exe_start_date: string;
  exe_end_date: string;
}

export interface QtestTestCycle {
  id: number;
  name: string;
  description: string;
  parent_id: number;
  pid: string;
}

export interface QtestTestSuite {
  id: number;
  name: string;
  description: string;
  test_cycle_id: number;
}

export interface QtestRequirement {
  id: number;
  name: string;
  description: string;
  pid: string;
  linked_test_cases?: Array<{ id: number; name: string; pid?: string }>;
}

export interface QtestDefect {
  id: number;
  summary: string;
  description: string;
  status: string;
  linked_test_run_id: number;
}

// Error type for structured API errors
export class QtestApiError extends Error {
  constructor(
    public statusCode: number,
    public responseBody: string,
    public url: string
  ) {
    super(`qTest API error ${statusCode}: ${responseBody}`);
    this.name = "QtestApiError";
  }
}

// Tool handler response type (MCP protocol)
export interface ToolResponse {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

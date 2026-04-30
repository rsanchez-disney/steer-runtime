import { getClient } from "./apiClient.js";

/**
 * Execute a GraphQL query against the GitHub API.
 * Uses the same auth token as the REST client.
 */
export async function graphql(query: string, variables: Record<string, any> = {}): Promise<any> {
    const octokit = getClient();
    return octokit.graphql(query, variables);
}

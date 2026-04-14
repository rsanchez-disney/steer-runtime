const GITHUB_REMOTE = process.env.GITHUB_REMOTE || "";

export function prefixToolName(name: string): string {
    return GITHUB_REMOTE ? `${GITHUB_REMOTE}_${name}` : name;
}

export function getServerName(): string {
    return GITHUB_REMOTE ? `github-${GITHUB_REMOTE}` : "github-mcp";
}

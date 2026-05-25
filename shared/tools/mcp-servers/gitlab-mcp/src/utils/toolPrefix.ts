const GITLAB_REMOTE = process.env.GITLAB_REMOTE || "";

export function prefixToolName(name: string): string {
    return GITLAB_REMOTE ? `${GITLAB_REMOTE}_${name}` : name;
}

export function getServerName(): string {
    return GITLAB_REMOTE ? `gitlab-${GITLAB_REMOTE}` : "gitlab-mcp";
}

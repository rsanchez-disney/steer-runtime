const CONFLUENCE_INSTANCE_PREFIX = process.env.CONFLUENCE_INSTANCE_PREFIX || "";

export function prefixToolName(name: string): string {
    return CONFLUENCE_INSTANCE_PREFIX ? `${CONFLUENCE_INSTANCE_PREFIX}${name}` : name;
}

export function getServerName(): string {
    return CONFLUENCE_INSTANCE_PREFIX ? `confluence-${CONFLUENCE_INSTANCE_PREFIX.replace(/_$/, "")}` : "confluence-mcp";
}

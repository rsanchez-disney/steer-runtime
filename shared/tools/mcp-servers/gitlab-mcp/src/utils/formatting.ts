export function formatTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, "-");
}

export function formatProjectId(project: string): string {
    return project.replace(/\//g, "-");
}

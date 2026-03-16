export function formatTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, "-");
}

export function formatRepoId(repo: string): string {
    return repo.replace(/\//g, "-");
}

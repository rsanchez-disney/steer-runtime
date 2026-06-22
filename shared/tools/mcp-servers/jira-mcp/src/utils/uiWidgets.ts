/**
 * MCP-UI HTML generators for tool responses.
 * These produce self-contained HTML that renders in Kite's ToolUIRenderer.
 */

export function ticketCard(ticket: {
  key: string; summary: string; status: string; assignee?: string;
  priority?: string; type?: string; description?: string; labels?: string[];
  created?: string; updated?: string; storyPoints?: number;
}): string {
  const statusColor = ticket.status === 'Done' || ticket.status === 'Closed' ? '#1a7f37'
    : ticket.status === 'In Progress' ? '#1f6feb'
    : ticket.status === 'Blocked' ? '#cf222e' : '#6e7681';

  return `<!DOCTYPE html><html><head><style>
    * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    body { padding:16px; background:#0d1117; color:#e6edf3; }
    .header { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
    .key { font-size:14px; font-weight:600; color:#58a6ff; }
    .status { font-size:11px; padding:2px 8px; border-radius:12px; background:${statusColor}22; color:${statusColor}; font-weight:500; }
    .summary { font-size:15px; font-weight:500; margin-bottom:12px; line-height:1.4; }
    .meta { display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px; color:#8b949e; }
    .meta-item { display:flex; flex-direction:column; gap:2px; }
    .meta-label { font-size:10px; text-transform:uppercase; color:#6e7681; }
    .desc { margin-top:12px; padding-top:12px; border-top:1px solid #21262d; font-size:13px; color:#8b949e; line-height:1.5; max-height:120px; overflow:auto; }
    .labels { display:flex; gap:4px; flex-wrap:wrap; margin-top:8px; }
    .label { font-size:10px; padding:2px 6px; border-radius:4px; background:#1f6feb22; color:#58a6ff; }
    .actions { display:flex; gap:8px; margin-top:12px; padding-top:12px; border-top:1px solid #21262d; }
    .btn { font-size:11px; padding:4px 10px; border-radius:6px; border:1px solid #30363d; background:#21262d; color:#e6edf3; cursor:pointer; }
    .btn:hover { background:#30363d; }
  </style></head><body>
    <div class="header">
      <span class="key">${ticket.key}</span>
      <span class="status">${ticket.status}</span>
      ${ticket.priority ? `<span style="font-size:11px;color:#8b949e">${ticket.priority}</span>` : ''}
      ${ticket.storyPoints ? `<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#8957e522;color:#a371f7">${ticket.storyPoints}sp</span>` : ''}
    </div>
    <div class="summary">${ticket.summary}</div>
    <div class="meta">
      ${ticket.assignee ? `<div class="meta-item"><span class="meta-label">Assignee</span>${ticket.assignee}</div>` : ''}
      ${ticket.type ? `<div class="meta-item"><span class="meta-label">Type</span>${ticket.type}</div>` : ''}
      ${ticket.created ? `<div class="meta-item"><span class="meta-label">Created</span>${ticket.created}</div>` : ''}
      ${ticket.updated ? `<div class="meta-item"><span class="meta-label">Updated</span>${ticket.updated}</div>` : ''}
    </div>
    ${ticket.labels?.length ? `<div class="labels">${ticket.labels.map(l => `<span class="label">${l}</span>`).join('')}</div>` : ''}
    ${ticket.description ? `<div class="desc">${ticket.description.slice(0, 500).replace(/</g, '&lt;')}</div>` : ''}
    <div class="actions">
      <button class="btn" onclick="window.parent.postMessage({type:'tool',payload:{toolName:'jira_transition_issue',params:{ticketId:'${ticket.key}'}}},'*')">Transition</button>
      <button class="btn" onclick="window.parent.postMessage({type:'tool',payload:{toolName:'jira_comment_on_issue',params:{ticketId:'${ticket.key}'}}},'*')">Comment</button>
      <button class="btn" onclick="window.parent.postMessage({type:'open-link',payload:{url:'https://disneyexperiences.atlassian.net/browse/${ticket.key}'}}},'*')">Open in Jira ↗</button>
    </div>
  </body></html>`;
}

export function issueTable(issues: { key: string; summary: string; status: string; assignee?: string; priority?: string; storyPoints?: number }[]): string {
  const rows = issues.map(t => {
    const sc = t.status === 'Done' ? '#1a7f37' : t.status === 'In Progress' ? '#1f6feb' : '#6e7681';
    return `<tr>
      <td><a href="#" onclick="window.parent.postMessage({type:'tool',payload:{toolName:'jira_get_issue',params:{ticketId:'${t.key}'}}},'*');return false" style="color:#58a6ff;text-decoration:none;font-family:monospace">${t.key}</a></td>
      <td>${t.summary}</td>
      <td><span style="color:${sc};font-size:11px">${t.status}</span></td>
      <td style="color:#8b949e">${t.assignee || '—'}</td>
      <td style="color:#8b949e">${t.storyPoints || '—'}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head><style>
    * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    body { padding:12px; background:#0d1117; color:#e6edf3; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    th { text-align:left; padding:6px 8px; border-bottom:1px solid #21262d; color:#8b949e; font-size:10px; text-transform:uppercase; }
    td { padding:6px 8px; border-bottom:1px solid #21262d; }
    tr:hover { background:#161b22; }
    .count { font-size:11px; color:#8b949e; margin-bottom:8px; }
  </style></head><body>
    <div class="count">${issues.length} issues</div>
    <table><thead><tr><th>Key</th><th>Summary</th><th>Status</th><th>Assignee</th><th>SP</th></tr></thead>
    <tbody>${rows}</tbody></table>
  </body></html>`;
}

export function sprintBoard(sprint: { name: string; daysRemaining: number }, issues: { key: string; summary: string; status: string }[]): string {
  const todo = issues.filter(i => ['To Do', 'Open', 'New', 'Backlog'].includes(i.status));
  const inProgress = issues.filter(i => ['In Progress', 'In Review', 'In Development'].includes(i.status));
  const done = issues.filter(i => ['Done', 'Closed', 'Resolved'].includes(i.status));

  const col = (title: string, items: typeof issues, color: string) => `
    <div class="col">
      <div class="col-header" style="border-top:3px solid ${color}">${title} (${items.length})</div>
      ${items.map(i => `<div class="card" onclick="window.parent.postMessage({type:'tool',payload:{toolName:'jira_get_issue',params:{ticketId:'${i.key}'}}},'*')">
        <span class="card-key">${i.key}</span>
        <span class="card-summary">${i.summary.slice(0, 60)}</span>
      </div>`).join('')}
    </div>`;

  return `<!DOCTYPE html><html><head><style>
    * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    body { padding:12px; background:#0d1117; color:#e6edf3; }
    .header { font-size:13px; font-weight:600; margin-bottom:8px; display:flex; justify-content:space-between; }
    .days { font-size:11px; color:#f0883e; }
    .board { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
    .col { background:#161b22; border-radius:8px; padding:8px; }
    .col-header { font-size:11px; font-weight:600; padding:4px 8px; margin-bottom:6px; color:#8b949e; }
    .card { padding:6px 8px; margin-bottom:4px; background:#0d1117; border-radius:6px; border:1px solid #21262d; cursor:pointer; }
    .card:hover { border-color:#30363d; }
    .card-key { font-size:10px; font-family:monospace; color:#58a6ff; display:block; }
    .card-summary { font-size:11px; color:#8b949e; }
  </style></head><body>
    <div class="header"><span>${sprint.name}</span><span class="days">${sprint.daysRemaining}d remaining</span></div>
    <div class="board">
      ${col('To Do', todo, '#6e7681')}
      ${col('In Progress', inProgress, '#1f6feb')}
      ${col('Done', done, '#1a7f37')}
    </div>
  </body></html>`;
}

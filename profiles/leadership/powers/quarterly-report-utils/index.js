const fs = require('fs');
const path = require('path');
const os = require('os');

// --- Config resolution ---

function loadConfig(configPath) {
  const resolved = configPath || path.join(os.homedir(), '.kiro', 'context', 'vertical-config.json');
  const data = fs.readFileSync(resolved, 'utf8');
  return JSON.parse(data);
}

function findStudio(config, name) {
  const lower = name.toLowerCase();
  return config.studios.find(s => s.name.toLowerCase() === lower);
}

// --- Fiscal calendar ---

function quarterDates(quarter) {
  // Parse "Q3 FY2026" -> { q: 3, fy: 2026 }
  const match = quarter.match(/Q(\d)\s*FY(\d{4})/i);
  if (!match) throw new Error(`Invalid quarter format: "${quarter}". Expected "Q3 FY2026".`);
  const q = parseInt(match[1]);
  const fy = parseInt(match[2]);

  // Disney fiscal year starts October. FY2026 Q1 = Oct 2025.
  // Q1=Oct-Dec, Q2=Jan-Mar, Q3=Apr-Jun, Q4=Jul-Sep
  const calendarYear = q === 1 ? fy - 1 : (q <= 3 ? fy : fy);
  const ranges = {
    1: { start: `${fy - 1}-10-01`, end: `${fy - 1}-12-31` },
    2: { start: `${fy}-01-01`, end: `${fy}-03-31` },
    3: { start: `${fy}-04-01`, end: `${fy}-06-30` },
    4: { start: `${fy}-07-01`, end: `${fy}-09-30` },
  };
  return ranges[q];
}

// --- JQL construction ---

function buildResolvedJql(studio, dates) {
  let jql = `project = ${studio.project}`;

  // Studio filter
  if (studio.query_method === 'studio_field') {
    jql += ` AND "Studio[Dropdown]" = "${studio.studio_field_value}"`;
  } else if (studio.query_method === 'combined') {
    const values = studio.studio_field_value.map(v => `"${v}"`).join(', ');
    jql += ` AND "Studio[Dropdown]" in (${values})`;
  } else if (studio.query_method === 'sprint_based') {
    // Sprint-based: caller should supply sprint names, but we add the project filter
    const prefixes = Array.isArray(studio.sprint_prefix) ? studio.sprint_prefix : [studio.sprint_prefix];
    jql += ` /* Filter by sprint names matching: ${prefixes.join(', ')} */`;
  }

  // Date filter
  jql += ` AND resolved >= "${dates.start}" AND resolved <= "${dates.end}"`;

  // Sub-task exclusion
  if (studio.sub_tasks === 'exclude') {
    jql += ` AND issuetype not in subTaskIssueTypes()`;
  }

  // Assignee exclusions (Forky, etc.)
  if (studio.assignee_exclusions && studio.assignee_exclusions.length > 0) {
    const exclusions = studio.assignee_exclusions.map(a => `"${a}"`).join(', ');
    jql += ` AND assignee NOT IN (${exclusions})`;
  }

  jql += ` ORDER BY resolved DESC`;
  return jql;
}

function buildCreatedJql(studio, dates) {
  let jql = `project = ${studio.project}`;

  if (studio.query_method === 'studio_field') {
    jql += ` AND "Studio[Dropdown]" = "${studio.studio_field_value}"`;
  } else if (studio.query_method === 'combined') {
    const values = studio.studio_field_value.map(v => `"${v}"`).join(', ');
    jql += ` AND "Studio[Dropdown]" in (${values})`;
  }

  jql += ` AND created >= "${dates.start}" AND created <= "${dates.end}"`;
  jql += ` ORDER BY created DESC`;
  return jql;
}

function buildEpicsJql(studio, dates) {
  let jql = `project = ${studio.project} AND issuetype = Epic`;
  jql += ` AND (resolved >= "${dates.start}" OR status != Done)`;
  jql += ` AND updated >= "${dates.start}"`;
  jql += ` ORDER BY resolved DESC`;
  return jql;
}

// --- Confluence XHTML formatting ---

function statusLozenge(text, colour) {
  return `<ac:structured-macro ac:name="status"><ac:parameter ac:name="colour">${colour}</ac:parameter><ac:parameter ac:name="title">${text}</ac:parameter></ac:structured-macro>`;
}

function infoPanel(content) {
  return `<ac:structured-macro ac:name="info"><ac:rich-text-body>${content}</ac:rich-text-body></ac:structured-macro>`;
}

function htmlTable(headers, rows) {
  let html = '<table><thead><tr>';
  headers.forEach(h => { html += `<th>${h}</th>`; });
  html += '</tr></thead><tbody>';
  rows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => { html += `<td>${cell}</td>`; });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function formatPage({ title, metrics, methodology, business_impact, deliverables, roadmap, risks, director_metrics }) {
  let body = '';

  // 1. Metrics
  body += '<h2>Metrics</h2>';
  body += htmlTable(
    ['Metric', 'Value'],
    [
      ['Resolved', metrics.resolved || 'N/A'],
      ['Created', metrics.created || 'N/A'],
      ['Net Backlog', metrics.net_backlog || 'N/A'],
      ['Issue Mix (Resolved)', metrics.issue_mix || 'N/A'],
      ['Sprint Velocity', metrics.velocity || 'N/A'],
    ]
  );

  // 2. Data Source & Methodology
  body += '<h2>Data source and methodology</h2>';
  const methTable = htmlTable(
    ['Field', 'Value'],
    [
      ['Project', methodology.project || ''],
      ['Filter Method', methodology.filter_method || ''],
      ['Filter Value', methodology.filter_value || ''],
      ['Date Filter', methodology.date_filter || ''],
      ['Sub-tasks', methodology.sub_tasks || ''],
      ['Board', methodology.board || ''],
      ['Sprint Range', methodology.sprint_range || ''],
      ['JQL', `<code>${methodology.jql || ''}</code>`],
    ]
  );
  body += infoPanel(methTable);

  // 3. Business Impact
  body += '<h2>Business impact</h2>';
  body += business_impact;

  // 4. Key Deliverables
  body += '<h2>Key deliverables</h2><ul>';
  (deliverables || []).forEach(d => { body += `<li>${d}</li>`; });
  body += '</ul>';

  // 5. Roadmap
  body += '<h2>Roadmap</h2>';
  const statusColors = { 'DONE': 'Green', 'IN PROGRESS': 'Blue', 'PLANNED': 'Yellow', 'BLOCKER': 'Red' };
  const roadmapRows = (roadmap || []).map(r => [
    `<strong>${r.lane}</strong>`,
    r.milestone,
    r.timeline,
    statusLozenge(r.status, r.status_color || statusColors[r.status] || 'Grey'),
  ]);
  body += htmlTable(['Lane', 'Milestone', 'Timeline', 'Status'], roadmapRows);

  // 6. Risks & Notes
  body += '<h2>Risks and notes</h2>';
  if (risks && risks.length > 0) {
    body += '<ul>';
    risks.forEach(r => { body += `<li>${r}</li>`; });
    body += '</ul>';
  } else {
    body += '<p>None identified this quarter.</p>';
  }

  // 7. Director Metrics
  body += '<h2>Director metrics</h2>';
  const dm = director_metrics || {};
  body += htmlTable(
    ['Metric', 'Value', 'Notes'],
    [
      ['Impact Classification', dm.impact_classification?.value || '', dm.impact_classification?.notes || ''],
      ['Guest Reach', dm.guest_reach?.value || '', dm.guest_reach?.notes || ''],
      ['Release Success Rate', dm.release_success_rate?.value || '', dm.release_success_rate?.notes || ''],
      ['Health Rating', dm.health_rating?.value || '', dm.health_rating?.notes || ''],
      ['Sprint Velocity', dm.velocity?.value || '', dm.velocity?.notes || ''],
      ['Blocked Items', dm.blocked_items?.value || '0', dm.blocked_items?.notes || 'None'],
    ]
  );

  return { title, body };
}

// --- Exported tool handlers ---

module.exports = {
  async resolve_studio({ studio_name, config_path }) {
    try {
      const config = loadConfig(config_path);
      const studio = findStudio(config, studio_name);
      if (!studio) {
        return {
          success: false,
          error: `Studio "${studio_name}" not found in config. Available: ${config.studios.map(s => s.name).join(', ')}`
        };
      }
      return {
        success: true,
        studio,
        vertical: config.vertical,
        confluence_space: config.confluence_space,
        parent_page_id: config.parent_page_id,
        freeze_windows: config.freeze_windows,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async build_jql({ studio_name, quarter, query_type = 'resolved', config_path }) {
    try {
      const config = loadConfig(config_path);
      const studio = findStudio(config, studio_name);
      if (!studio) {
        return {
          success: false,
          error: `Studio "${studio_name}" not found. Available: ${config.studios.map(s => s.name).join(', ')}`
        };
      }

      const dates = quarterDates(quarter);
      let jql;

      switch (query_type) {
        case 'created':
          jql = buildCreatedJql(studio, dates);
          break;
        case 'epics':
          jql = buildEpicsJql(studio, dates);
          break;
        case 'resolved':
        default:
          jql = buildResolvedJql(studio, dates);
          break;
      }

      return {
        success: true,
        jql,
        studio: studio.name,
        project: studio.project,
        query_method: studio.query_method,
        quarter,
        dates,
        sub_tasks: studio.sub_tasks,
        notes: studio.notes || null,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async format_confluence_page(params) {
    try {
      const result = formatPage(params);
      return {
        success: true,
        title: result.title,
        body: result.body,
        format: 'storage',
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

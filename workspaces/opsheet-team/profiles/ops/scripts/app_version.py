#!/usr/bin/env python3
"""Calculate AppVersion for JIRA tickets by tracing merged PRs to RC tags.

Usage: python3 app_version.py OPS-26207 OPS-26208
Requires: aiohttp (pip install aiohttp)
Auth: Reads JIRA_PAT and GITHUB_TOKEN from ~/.kiro/settings/mcp.json or env vars.
"""

import asyncio
import json
import os
import re
import sys
from pathlib import Path

try:
    import aiohttp
except ImportError:
    print('Missing dependency. Run: pip install aiohttp', file=sys.stderr)
    sys.exit(1)

# ── Config ───────────────────────────────────────────────────────────────────

GH_HOST = 'github.disney.com'
GH_API = f'https://{GH_HOST}/api/v3'
ORG = 'wdpr-parkops-opsheet-suite'
JIRA_URL = 'https://myjira.disney.com'

EXCLUDE_REPOS = {
    'opsheet-api-designs', 'opsheet-bruno-collections',
    'opsheet-types-go', 'opsheet-migration-tools',
}

REPO_SERVICE_MAP = {
    'opsheet-plus-web': 'opsheetweb',
    'opsheet-plus-vas': 'opsheetvasapi',
    'opsheet-plus-web-server': 'opsheetwebserver',
    'opsheet-plus-mobile': 'opsheetmobile',
    'wait-time-service-go': 'opsheetwaittimesservice',
    'alerts-monorepo-go': 'opsheetalertsapi',
    'admin-service-go': 'opsheetadminservice',
    'configuration-service-go': 'opsheetconfigservice',
    'counts-service-go': 'opsheetcountsservice',
    'counts-forecast-service-go': 'opsheetcountsforecastservice',
    'counts-polling-go': 'opsheetcountspolling',
    'counts-bucket-go': 'opsheetcountsbucket',
    'counts-summarization-go': 'opsheetcountssummarization',
    'counts-resummarization-go': 'countsresummarizationgo',
    'counts-averager-monorepo-go': 'opsheetcountsaverager',
    'cle-service-go': 'opsheetcleservice',
    'data-snapshot-service-go': 'opsheetdatasnapshot',
    'definition-tables-service': 'opsheetdefinitiontables',
    'dispatch-service-go': 'opsheetdispatch',
    'facility-service-go': 'entityservice',
    'future-event-polling-go': 'opsheetfutureeventpolling',
    'global-counter-service-go': 'opsheetglobalcounter',
    'history-service-go': 'opsheethistory',
    'lane-service-go': 'opsheetlaneservice',
    'lost-efficiency-process-go': 'opsheetlostefficiencyprocessservice',
    'occupancy-service-go': 'opsheetoccupancyservicego',
    'operating-status-mono-go': 'opsheetoperatingstatusmono',
    'operations-resummarization-go': 'operationsresummarizationgo',
    'ops-data-import-go': 'opsheetdataimport',
    'ops-mobile-go': 'opsheetmobilego',
    'reporting-emitter-go': 'opsheetplusreportingemitter',
    'reporting-legacy-emitter-go': 'opsheetlegacyreportingemitter',
    'schedules-monorepo-go': 'opsheetschedulesapiservice',
    'system-announcement-service-go': 'opsheetsystemannouncement',
    'test-utility-service': 'opsheettestutilityservice',
    'translation-service-go': 'opsheettranslation',
    'user-management-service-go': 'opsheetusermgmt',
    'wait-times-monorepo-go': 'opsheetwaittimesapiingest',
    'big-proxy-service': 'opsheetbigproxyservice',
    'opsheet-suite-infra': 'opsheetinfra',
    'opshin-api-guestcount-ingest': 'opsheetapiguestcountingest',
    'opshin-snapp-ingest': 'opsheetsnappingest',
    'opshin-galaxy-ingest': 'opsheetgalaxyingest',
    'opshin-history-ingest': 'opsheethistoryingest',
    'opshin-cron-schedule': 'opsheetcronschedule',
    'opshin-cron-occupancy': 'opsheetcronoccupancy',
    'opshin-dispatch-ingest': 'opsheetdispatchingest2',
    'opshin-edh-ingest': 'opshinedhingest',
    'opshin-sarg-ingest': 'opsheetsargingest',
    'opshin-schedules-ingest': 'opsheetschedulesingest',
    'opshin-system-event-ingest': 'opsheetsystemeventingest',
    'opsheet-process-reporting-newrelic': 'opsheetprocessreportingnewrelic',
    'opsheet-process-entity-promotion': 'opsheetprocessentitypromotion',
    'opsheet-process-snapp-counts': 'opsheetprocesssnappcounts',
    'opsheet-process-dataimport-gateforecast': 'opsheetprocessdataimportgateforecast',
    'opsheet-process-dscribe': 'opsheetprocessdscribe',
    'opsheet-process-emails': 'opsheetprocessemails',
    'opsheet-process-galaxy-counts': 'opsheetprocessgalaxycounts',
    'opsheet-process-access-request-expire': 'opsheetprocessaccessrequestexpire',
    'opsheet-process-system-event': 'opsheetprocesssystemevent',
    'opsheet-process-user-update': 'opsheetprocessuserupdate',
    'opsheet-process-purge': 'opsheetprocesspurge',
    'opsheet-process-purge-operations': 'opsheetprocesspurgeoperations',
    'opsheet-process-guestcount': 'opsheetguestcountprocess',
    'opsheet-process-dispatch': 'opsheetdispatchprocess',
    'opsheet-process-legacyschedules': 'opsheetlegacyschedulesprocess',
    'opsheet-change-notification-processor': 'opsheetchangenotificationprocessor',
    'opsheet-cloudwatch-log-ingest': 'opsheetcloudwatchlogsingest',
}

RC_TAG_RE = re.compile(r'^v(\d+)\.(\d+)\.(\d+)-rc\.(\d+)$')


def rc_sort_key(tag: str):
    m = RC_TAG_RE.match(tag)
    return tuple(int(x) for x in m.groups()) if m else (0, 0, 0, 0)


# ── Auth ─────────────────────────────────────────────────────────────────────

def load_tokens():
    jira_pat = os.environ.get('JIRA_PAT', '')
    gh_token = os.environ.get('GITHUB_TOKEN', '')
    if jira_pat and gh_token:
        return jira_pat, gh_token

    mcp_cfg = Path.home() / '.kiro' / 'settings' / 'mcp.json'
    if mcp_cfg.exists():
        cfg = json.loads(mcp_cfg.read_text())
        if not jira_pat:
            jira_pat = cfg.get('mcpServers', {}).get('jira', {}).get('env', {}).get('JIRA_PAT', '')
        if not gh_token:
            gh_token = cfg.get('mcpServers', {}).get('github', {}).get('env', {}).get('GITHUB_TOKEN', '')

    if not jira_pat:
        print('Error: JIRA_PAT not found', file=sys.stderr)
        sys.exit(1)
    if not gh_token:
        print('Error: GITHUB_TOKEN not found', file=sys.stderr)
        sys.exit(1)
    return jira_pat, gh_token


# ── API helpers ──────────────────────────────────────────────────────────────

class Client:
    def __init__(self, jira_pat: str, gh_token: str):
        self.jira_pat = jira_pat
        self.gh_token = gh_token
        self.session: aiohttp.ClientSession | None = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, *_):
        if self.session:
            await self.session.close()

    async def jira(self, path: str):
        headers = {'Authorization': f'Bearer {self.jira_pat}', 'Content-Type': 'application/json'}
        async with self.session.get(f'{JIRA_URL}{path}', headers=headers, ssl=False) as r:
            if r.status != 200:
                return None
            return await r.json(content_type=None)

    async def gh(self, path: str):
        headers = {'Authorization': f'token {self.gh_token}', 'Accept': 'application/vnd.github.v3+json'}
        async with self.session.get(f'{GH_API}{path}', headers=headers, ssl=False) as r:
            if r.status != 200:
                return None
            # Handle potential control chars in Go commit messages
            text = await r.text()
            text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)
            return json.loads(text)


# ── Core logic ───────────────────────────────────────────────────────────────

def parse_pr_url(url: str):
    """Extract (repo, pr_number) from a GitHub PR URL."""
    m = re.search(r'/([^/]+)/pull/(\d+)$', url)
    return (m.group(1), int(m.group(2))) if m else (None, None)


async def get_subtasks(client: Client, ticket_id: str) -> list[str]:
    data = await client.jira(f'/rest/api/2/search?jql=parent={ticket_id}&fields=key')
    if not data:
        return []
    return [i['key'] for i in data.get('issues', [])]


async def get_merged_pr_urls(client: Client, ticket_id: str) -> list[str]:
    issue = await client.jira(f'/rest/api/2/issue/{ticket_id}?fields=summary')
    if not issue:
        return []
    issue_id = issue.get('id')
    if not issue_id:
        return []

    dev = await client.jira(
        f'/rest/dev-status/1.0/issue/detail?issueId={issue_id}'
        f'&applicationType=githube&dataType=pullrequest'
    )
    if not dev:
        return []

    urls = []
    for detail in dev.get('detail', []):
        for pr in detail.get('pullRequests', []):
            if pr.get('status') == 'MERGED' and pr.get('url'):
                urls.append(pr['url'])
    return urls


async def get_pr_merge_info(client: Client, repo: str, pr_num: int):
    """Returns (merge_sha, merged_at) or (None, None)."""
    data = await client.gh(f'/repos/{ORG}/{repo}/pulls/{pr_num}')
    if not data:
        return None, None
    return data.get('merge_commit_sha'), data.get('merged_at')


async def find_first_rc_tag(client: Client, repo: str, merge_sha: str) -> str:
    """Find the first RC tag that contains the merge commit."""
    data = await client.gh(f'/repos/{ORG}/{repo}/tags?per_page=100')
    if not data:
        return 'NO_TAGS'

    tags = [t['name'] for t in data if RC_TAG_RE.match(t['name'])]
    tags.sort(key=rc_sort_key)

    if not tags:
        return 'NO_TAGS'

    # Fire all compare requests concurrently
    async def check_tag(tag):
        cmp = await client.gh(f'/repos/{ORG}/{repo}/compare/{merge_sha}...{tag}')
        status = cmp.get('status', '') if cmp else ''
        return tag, status

    results = await asyncio.gather(*[check_tag(t) for t in tags])

    for tag, status in results:
        if status in ('ahead', 'identical'):
            return tag

    return 'NOT_TAGGED_YET'


async def process_ticket(client: Client, ticket_id: str) -> str:
    """Process a single ticket and return formatted output."""
    lines = []
    log = lambda msg: print(f'  [{ticket_id}] {msg}', file=sys.stderr)

    log('Checking subtasks...')
    subtasks = await get_subtasks(client, ticket_id)
    all_tickets = [ticket_id] + subtasks
    if subtasks:
        log(f'Subtasks: {" ".join(subtasks)}')

    # Get all merged PR URLs concurrently across all tickets
    pr_url_lists = await asyncio.gather(*[get_merged_pr_urls(client, t) for t in all_tickets])
    all_pr_urls = sorted(set(url for urls in pr_url_lists for url in urls))

    if not all_pr_urls:
        return (
            f'\n═══════════════════════════════════════════════════\n'
            f' AppVersion for {ticket_id}\n'
            f'═══════════════════════════════════════════════════\n'
            f' No merged PRs found.\n'
            f'═══════════════════════════════════════════════════'
        )

    # Parse and filter PRs
    pr_info = []
    for url in all_pr_urls:
        repo, pr_num = parse_pr_url(url)
        if not repo or repo in EXCLUDE_REPOS:
            continue
        pr_info.append((repo, pr_num))

    # Fetch all PR merge info concurrently
    log(f'Fetching {len(pr_info)} PRs...')
    merge_results = await asyncio.gather(
        *[get_pr_merge_info(client, repo, pr_num) for repo, pr_num in pr_info]
    )

    # Group by repo, keep most recent
    repo_latest: dict[str, tuple[str, str, int]] = {}  # repo -> (sha, date, pr_num)
    for (repo, pr_num), (sha, merged_at) in zip(pr_info, merge_results):
        if not sha or not merged_at:
            continue
        prev = repo_latest.get(repo)
        if not prev or merged_at > prev[1]:
            repo_latest[repo] = (sha, merged_at, pr_num)

    # Find first RC tag for each repo concurrently
    log(f'Resolving tags for {len(repo_latest)} repos...')
    tag_tasks = {
        repo: find_first_rc_tag(client, repo, info[0])
        for repo, info in repo_latest.items()
    }
    tag_results = await asyncio.gather(*tag_tasks.values())
    repo_tags = dict(zip(tag_tasks.keys(), tag_results))

    # Format results
    result_lines = []
    for repo in sorted(repo_tags.keys()):
        service = REPO_SERVICE_MAP.get(repo, repo)
        tag = repo_tags[repo]
        if tag == 'NO_TAGS':
            result_lines.append(f'{service} — no RC tags found')
        elif tag == 'NOT_TAGGED_YET':
            sha = repo_latest[repo][0][:12]
            result_lines.append(f'{service} — not tagged yet (SHA: {sha})')
        else:
            result_lines.append(f'{service} {tag}')

    body = '\n'.join(sorted(result_lines))
    return (
        f'\n═══════════════════════════════════════════════════\n'
        f' AppVersion for {ticket_id}\n'
        f'═══════════════════════════════════════════════════\n'
        f'{body}\n'
        f'═══════════════════════════════════════════════════'
    )


async def main():
    if len(sys.argv) < 2:
        print(f'Usage: {sys.argv[0]} OPS-XXXXX [OPS-YYYYY ...]', file=sys.stderr)
        sys.exit(1)

    tickets = sys.argv[1:]
    jira_pat, gh_token = load_tokens()

    async with Client(jira_pat, gh_token) as client:
        results = await asyncio.gather(*[process_ticket(client, t) for t in tickets])

    for result in results:
        print(result)


if __name__ == '__main__':
    asyncio.run(main())

#!/usr/bin/env python3
"""Generate the POS Daily Epic Status Report HTML file."""
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, '..', '..', '..', '..', '..', 'POS Output')
os.makedirs(OUTPUT_DIR, exist_ok=True)

html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POS DSP 2.1.1 — Daily Epic Status Report — May 22, 2026</title>
    <style>
        :root {
            --primary: #1a237e;
            --accent: #0d47a1;
            --success: #2e7d32;
            --warning: #f57f17;
            --danger: #c62828;
            --bg: #f5f7fa;
            --card: #ffffff;
            --border: #e0e4ea;
            --text: #1a1a2e;
            --muted: #5f6b7a;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            padding: 2rem;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        header {
            background: linear-gradient(135deg, var(--primary), var(--accent));
            color: white;
            padding: 2rem 2.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);
        }
        header h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 0.25rem; }
        header .meta { opacity: 0.85; font-size: 0.9rem; display: flex; gap: 2rem; flex-wrap: wrap; margin-top: 0.5rem; }
        header .meta span { display: inline-flex; align-items: center; gap: 0.3rem; }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .kpi-card {
            background: var(--card);
            border-radius: 10px;
            padding: 1.25rem 1.5rem;
            border: 1px solid var(--border);
            box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }
        .kpi-card .label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); font-weight: 600; }
        .kpi-card .value { font-size: 2rem; font-weight: 700; margin: 0.25rem 0; }
        .kpi-card .delta { font-size: 0.85rem; font-weight: 500; }
        .delta-up { color: var(--success); }
        .delta-down { color: var(--danger); }
        .delta-neutral { color: var(--muted); }
        section {
            background: var(--card);
            border-radius: 10px;
            padding: 1.75rem 2rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border);
            box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }
        section h2 {
            font-size: 1.15rem;
            font-weight: 700;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--border);
            color: var(--primary);
        }
        section h3 { font-size: 0.95rem; color: var(--muted); margin: 1.5rem 0 0.75rem; }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        th {
            background: #f0f3f8;
            text-align: left;
            padding: 0.6rem 0.75rem;
            font-weight: 600;
            color: var(--muted);
            text-transform: uppercase;
            font-size: 0.72rem;
            letter-spacing: 0.03em;
        }
        td { padding: 0.6rem 0.75rem; border-top: 1px solid var(--border); }
        tr:hover td { background: #f8fafc; }
        .text-right { text-align: right; }
        .badge {
            display: inline-block;
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
            font-size: 0.72rem;
            font-weight: 600;
        }
        .badge-critical { background: #ffebee; color: var(--danger); }
        .badge-high { background: #fff3e0; color: #e65100; }
        .badge-medium { background: #e3f2fd; color: #1565c0; }
        .badge-low { background: #f3e5f5; color: #6a1b9a; }
        .badge-blocked { background: #ffebee; color: var(--danger); border: 1px solid var(--danger); }
        .alert {
            padding: 1rem 1.25rem;
            border-radius: 8px;
            margin: 1rem 0;
            font-size: 0.9rem;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
        }
        .alert-danger { background: #ffebee; border-left: 4px solid var(--danger); }
        .alert-warning { background: #fff8e1; border-left: 4px solid var(--warning); }
        .alert-info { background: #e3f2fd; border-left: 4px solid var(--accent); }
        .alert-success { background: #e8f5e9; border-left: 4px solid var(--success); }
        .alert .icon { font-size: 1.2rem; flex-shrink: 0; }
        .actions-list { list-style: none; padding: 0; }
        .actions-list li {
            padding: 0.6rem 0;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .actions-list li:last-child { border-bottom: none; }
        .actions-list .num {
            background: var(--primary);
            color: white;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: 700;
            flex-shrink: 0;
        }
        .progress-bar { background: #e0e4ea; border-radius: 6px; height: 8px; overflow: hidden; margin-top: 0.5rem; }
        .progress-fill { height: 100%; border-radius: 6px; }
        .progress-done { background: var(--success); }
        .progress-active { background: var(--accent); }
        footer { text-align: center; color: var(--muted); font-size: 0.8rem; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border); }
        @media (max-width: 768px) {
            body { padding: 1rem; }
            .kpi-grid { grid-template-columns: repeat(2, 1fr); }
            header .meta { flex-direction: column; gap: 0.25rem; }
        }
    </style>
</head>
<body>
<div class="container">

    <header>
        <h1>POS Program — DSP 2.1.1 Epic Status Report</h1>
        <div class="meta">
            <span>&#x1F4C5; May 22, 2026</span>
            <span>&#x1F4CB; Daily Report</span>
            <span>&#x1F3AF; 76 Epics Tracked</span>
            <span>&#x1F41B; 350 Open Issues</span>
        </div>
    </header>

    <!-- KPI Cards -->
    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="label">Done</div>
            <div class="value">51</div>
            <div class="delta delta-up">67.1% complete</div>
        </div>
        <div class="kpi-card">
            <div class="label">In Progress</div>
            <div class="value">13</div>
            <div class="delta delta-neutral">17.1% of total</div>
        </div>
        <div class="kpi-card">
            <div class="label">In QA</div>
            <div class="value">11</div>
            <div class="delta delta-neutral">14.5% of total</div>
        </div>
        <div class="kpi-card">
            <div class="label">In Review</div>
            <div class="value">1</div>
            <div class="delta delta-neutral">1.3% of total</div>
        </div>
        <div class="kpi-card">
            <div class="label">Blocked Issues</div>
            <div class="value" style="color:var(--danger)">2</div>
            <div class="delta delta-down">Requires attention</div>
        </div>
        <div class="kpi-card">
            <div class="label">P1 Critical Bugs</div>
            <div class="value" style="color:var(--warning)">5</div>
            <div class="delta delta-neutral">All in Awaiting Release</div>
        </div>
    </div>

    <!-- Overall Progress -->
    <section>
        <h2>Overall Epic Progress</h2>
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
            <span><strong>51 Done</strong> of 76 total</span>
            <span>67.1%</span>
        </div>
        <div class="progress-bar" style="height:12px;">
            <div class="progress-fill progress-done" style="width:67.1%"></div>
        </div>
        <div style="display:flex; gap:2rem; margin-top:0.75rem; font-size:0.8rem; color:var(--muted);">
            <span>&#x2705; Done: 51</span>
            <span>&#x1F527; In Progress: 13</span>
            <span>&#x1F50D; In QA: 11</span>
            <span>&#x1F4DD; In Review: 1</span>
        </div>
    </section>
'''

with open(os.path.join(OUTPUT_DIR, 'pos-daily-epic-report-2026-05-22.html'), 'w') as f:
    f.write(html)
print('Part 1 written')

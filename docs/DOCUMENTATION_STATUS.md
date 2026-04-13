# Documentation Status — April 13, 2026

Current status of all documentation after the installation guides consolidation.

---

## Setup & Onboarding

| Document | Purpose | Status |
|----------|---------|--------|
| **[README.md](../README.md)** | Quick start, profiles, features overview | ✅ Updated |
| **[GETTING_STARTED.md](GETTING_STARTED.md)** | First-time access, Disney SSO, project manifest | ✅ Updated |
| **[SETUP.md](SETUP.md)** | Step-by-step installation (macOS/Linux) | ✅ Updated |
| **[WINDOWS_SETUP.md](WINDOWS_SETUP.md)** | Step-by-step installation (Windows/WSL) | ✅ Updated |
| **[INSTALL_GUIDE.md](SETUP.md)** | Renamed → SETUP.md | 🗑️ Removed |
| **[SETUP_GUIDE.md](SETUP.md)** | Deprecated, removed | 🗑️ Removed |

## Agent & Profile Reference

| Document | Purpose | Status |
|----------|---------|--------|
| **[AGENTS.md](../AGENTS.md)** | Complete reference for all 55 agents | ✅ Current |
| **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** | High-level project overview | ✅ Current |

## Usage Guides

| Document | Purpose | Status |
|----------|---------|--------|
| **[PROMPT_GUIDE.md](PROMPT_GUIDE.md)** | How to prompt agents effectively | ✅ Current |
| **[DEV_QUICK_START.md](DEV_QUICK_START.md)** | Developer quick start | ✅ Current |
| **[STEER_MASTER_QUICK_START.md](STEER_MASTER_QUICK_START.md)** | Steer master quick start | ✅ Current |
| **[KIRO_CLI_VS_UI.md](KIRO_CLI_VS_UI.md)** | CLI vs UI comparison | ✅ Current |
| **[IDE_CONCEPTS_COMPARISON.md](IDE_CONCEPTS_COMPARISON.md)** | IDE concepts comparison | ✅ Current |

## Role-Specific Guides

| Document | Purpose | Status |
|----------|---------|--------|
| **[BA_PROMPT_GUIDE.md](BA_PROMPT_GUIDE.md)** | BA prompt guide | ✅ Current |
| **[BA_WORKFLOWS.md](BA_WORKFLOWS.md)** | BA workflows | ✅ Current |
| **[BA_QUICK_REFERENCE.md](BA_QUICK_REFERENCE.md)** | BA quick reference | ✅ Current |
| **[QA_PROMPT_GUIDE.md](QA_PROMPT_GUIDE.md)** | QA prompt guide | ✅ Current |
| **[QA_WORKFLOWS.md](QA_WORKFLOWS.md)** | QA workflows | ✅ Current |
| **[QA_QUICK_REFERENCE.md](QA_QUICK_REFERENCE.md)** | QA quick reference | ✅ Current |
| **[QA_PROFILE_OVERVIEW.md](QA_PROFILE_OVERVIEW.md)** | QA profile overview | ✅ Current |
| **[OPS_PROMPT_GUIDE.md](OPS_PROMPT_GUIDE.md)** | Ops prompt guide | ✅ Current |
| **[OPS_WORKFLOWS.md](OPS_WORKFLOWS.md)** | Ops workflows | ✅ Current |
| **[OPS_QUICK_REFERENCE.md](OPS_QUICK_REFERENCE.md)** | Ops quick reference | ✅ Current |
| **[PM_PROMPT_GUIDE.md](PM_PROMPT_GUIDE.md)** | PM prompt guide | ✅ Current |
| **[PM_WORKSPACES_GUIDE.md](PM_WORKSPACES_GUIDE.md)** | PM workspaces guide | ✅ Current |

## Architecture & Design

| Document | Purpose | Status |
|----------|---------|--------|
| **[DESIGN.md](DESIGN.md)** | System architecture and design decisions | ✅ Current |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Architecture overview | ✅ Current |
| **[ORCHESTRATOR_DELEGATION_REVIEW.md](ORCHESTRATOR_DELEGATION_REVIEW.md)** | Orchestration patterns | ✅ Current |
| **[HOOKS_AND_POWERS.md](HOOKS_AND_POWERS.md)** | Hooks and powers reference | ✅ Current |

## Configuration & Infrastructure

| Document | Purpose | Status |
|----------|---------|--------|
| **[MCP_SETUP.md](MCP_SETUP.md)** | MCP server configuration | ✅ Current |
| **[MEMORY_MCP.md](MEMORY_MCP.md)** | Memory MCP setup | ✅ Current |
| **[KIRO_UI_SETUP.md](KIRO_UI_SETUP.md)** | Kiro UI specific setup | ✅ Current |
| **[CURSOR_SETUP.md](CURSOR_SETUP.md)** | Cursor IDE setup | ✅ Current |
| **[MOBILE_AGENTS_SETUP.md](MOBILE_AGENTS_SETUP.md)** | Mobile agent setup | ✅ Current |
| **[TEAM_WORKSPACES.md](TEAM_WORKSPACES.md)** | Team workspace configuration | ✅ Current |
| **[REFERENCE.md](REFERENCE.md)** | Full command and config reference | ✅ Current |

## Strategy & Planning

| Document | Purpose | Status |
|----------|---------|--------|
| **[ROADMAP.md](ROADMAP.md)** | Feature roadmap | ✅ Current |
| **[FORK_STRATEGY.md](FORK_STRATEGY.md)** | Fork strategy for multi-team | ✅ Current |
| **[EVAL_FRAMEWORK.md](EVAL_FRAMEWORK.md)** | Agent quality scoring framework | ✅ Current |
| **[ENTERPRISE_MEMORY_BANK_ASSESSMENT.md](ENTERPRISE_MEMORY_BANK_ASSESSMENT.md)** | Enterprise memory bank assessment | ✅ Current |
| **[ENTERPRISE_MEMORY_BANK_DIAGRAMS.md](ENTERPRISE_MEMORY_BANK_DIAGRAMS.md)** | Enterprise memory bank diagrams | ✅ Current |

## Meta & Navigation

| Document | Purpose | Status |
|----------|---------|--------|
| **[INDEX.md](INDEX.md)** | Documentation index | ✅ Updated |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Troubleshooting guide | ✅ Current |
| **[SETUP_CONSOLIDATION.md](SETUP_CONSOLIDATION.md)** | Historical: setup script consolidation (March 2026) | 📋 Historical |

---

## Recent Changes (April 13, 2026)

- Renamed `INSTALL_GUIDE.md` → `SETUP.md`, scoped to macOS/Linux only
- Rewrote `GETTING_STARTED.md` to focus on access, SSO, and project manifest
- Removed deprecated `SETUP_GUIDE.md`
- Added cross-links between `SETUP.md`, `WINDOWS_SETUP.md`, and `GETTING_STARTED.md`
- Removed Windows TBD sections from `SETUP.md`
- Simplified README.md "Get Started" section to reference setup docs
- Fixed broken links: `KIRO_IDE_WINDOWS_SETUP.md`, `.kiro/powers/GUIDE.md`
- Updated `INDEX.md` with all setup docs and corrected agent count (55)

---

## Reference Consistency

- ✅ `koda` (primary) or `./setup.sh` (fallback)
- ✅ `.kiro/` directory structure
- ✅ 55 agents across 9 profiles
- ✅ Setup docs: GETTING_STARTED → SETUP (macOS/Linux) / WINDOWS_SETUP (Windows)
- ✅ No remaining references to deleted files (SETUP_GUIDE.md, INSTALL_GUIDE.md)

---

**Last Updated:** April 13, 2026
**Version:** 3.7.0

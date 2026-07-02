---
inclusion: fileMatch
fileMatchPattern: ["packages/main/**/*.ts", "packages/renderer/**/*.tsx", "packages/renderer/**/*.ts", "packages/shared/**/*.ts", "electron-builder.*"]
description: Electron + React rules for Kite and Mouseketool desktop apps
---

# Electron apps (Kite, Mouseketool) steering

## Architecture

- Monorepo with `packages/main` (Electron main process), `packages/renderer` (React UI), `packages/shared` (types/utils)
- Main process: Node.js + Electron APIs — no React, no DOM
- Renderer process: React 19 + Vite 7 + TypeScript — no Node.js APIs directly
- IPC bridge: `contextBridge.exposeInMainWorld` for secure main↔renderer communication

## Critical rule: dependency mirroring

Runtime dependencies used in `packages/main/package.json` **MUST also appear** in the root `package.json`. Electron-builder resolves from root during packaging.

Failing to mirror causes `ERR_MODULE_NOT_FOUND` in production builds.

## Conventions

- IPC channels: define in `packages/shared/ipc-channels.ts` — never use magic strings
- State management: React context + hooks — no external state library
- Styling: Tailwind CSS in renderer — no inline styles except dynamic values
- Error boundaries: wrap every major UI section
- Use `app.getPath('userData')` for persistent storage paths

## Building and packaging

- Dev: `make dev` (Vite HMR for renderer, Electron reload for main)
- Package: `make package` → produces platform-specific app in `out/`
- Distribution: encrypted artifacts via `koda apps` marketplace
- Never commit `out/` or `node_modules/`

## Kite-specific

- Spawns kiro-cli via ACP protocol (Application Context Protocol)
- Sessions stored in SQLite: `~/.kiro/settings/sessions.db`
- Prompt scoring: POST to prompt-score API before sending to LLM
- System tray integration for background operation

## Testing

- Unit tests: Vitest for renderer components
- Integration: test IPC round-trips via Electron test utilities
- Package test: `open out/mac-arm64/Kite.app` and verify no crash

## Do not

- Do not use `require()` in renderer — use ES imports only
- Do not access `process` or `fs` in renderer — use IPC bridge
- Do not add native modules without testing cross-platform packaging
- Do not change IPC channel names without updating both main and renderer

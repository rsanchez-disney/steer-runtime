# Angular ↔ Node.js ↔ TypeScript Compatibility Matrix

## Full compatibility table

| Angular | Node.js | TypeScript | RxJS | Supported until |
|---------|---------|-----------|------|-----------------|
| 5.x | 6–8 | 2.4–2.7 | 5.x | Apr 2019 |
| 6.x | 8–10 | 2.7–2.9 | 6.x | Nov 2019 |
| 7.x | 8–10 | 3.1–3.2 | 6.x | Apr 2020 |
| 8.x | 10–12 | 3.4–3.5 | 6.x | Nov 2020 |
| 9.x | 10–12 | 3.6–3.8 | 6.x | Aug 2021 |
| 10.x | 10–12 | 3.9–4.0 | 6.x | Dec 2021 |
| 11.x | 10–12 | 4.0–4.1 | 6.x | May 2022 |
| 12.x | 12–16 | 4.2–4.3 | 6.x–7.x | Nov 2022 |
| 13.x | 12–16 | 4.4–4.5 | 6.x–7.x | Jun 2023 |
| 14.x | 14–18 | 4.6–4.8 | 6.x–7.x | Nov 2023 |
| 15.x | 14–18 | 4.8–4.9 | 6.x–7.x | May 2024 |
| 16.x | 16–20 | 4.9–5.1 | 6.x–7.x | Nov 2024 |
| 17.x | 18–20 | 5.2–5.4 | 6.x–7.x | May 2025 |
| 18.x | 18–22 | 5.4–5.5 | 7.x | Nov 2025 |
| 19.x | 18–22 | 5.5–5.7 | 7.x | May 2026 |
| 20.x | 20–24 | 5.6–5.8 | 7.x | Nov 2026 |
| 21.x | 20–24 | 5.7–5.9 | 7.x | May 2027 |
| 22.x | 22–24 | 5.8+ | 7.x | Nov 2027 |

## Key Node.js switchover points

When migrating through these versions, you MUST switch Node.js:

| Upgrading to | Minimum Node.js | Recommended Node.js |
|-------------|-----------------|---------------------|
| Angular 12 | 12.x | 16.x |
| Angular 14 | 14.x | 18.x |
| Angular 16 | 16.x | 18.x |
| Angular 17 | 18.x | 20.x |
| Angular 18 | 18.x | 20.x |
| Angular 20 | 20.x | 22.x |
| Angular 22 | 22.x | 24.x |

## Package manager support

| Angular | npm | yarn | pnpm |
|---------|-----|------|------|
| 5–14 | 6.x+ | 1.x | ❌ |
| 15–16 | 7.x+ | 1.x, 3.x | ✅ |
| 17+ | 9.x+ | 1.x, 3.x, 4.x | ✅ |
| 19+ | 10.x+ | 1.x, 4.x | ✅ |
| 20+ | 10.x+ | 4.x | ✅ |

## TypeScript version alignment

If `ng update` doesn't bump TypeScript automatically:

```bash
# Check required TS version
ng version

# Install the correct TypeScript
npm install typescript@~<required-version> --save-dev
```

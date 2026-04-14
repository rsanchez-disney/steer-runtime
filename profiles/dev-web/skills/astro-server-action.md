# Skill: Astro server action

Use when creating a server-side API endpoint or action.

## Checklist
1. Create file in `src/actions/`
2. Accept `APIContext` parameter for request/response access
3. Extract auth token from request headers (never expose to client)
4. Call external API with proper error handling
5. Return structured response: `{ success, data?, error? }`
6. Add `.test.ts` covering success and error paths

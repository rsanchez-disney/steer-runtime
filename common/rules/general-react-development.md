# React Development Standards

## Component Patterns

- Use functional components with hooks — no class components
- One component per file, file name matches component name
- Use TypeScript for all components
- Keep components small — extract when >150 lines

## File Structure

```
src/
├── components/       # Shared/reusable components
│   └── Button/
│       ├── Button.tsx
│       ├── Button.test.tsx
│       └── index.ts
├── pages/            # Route-level components
├── hooks/            # Custom hooks
├── services/         # API calls
├── stores/           # State management
├── types/            # TypeScript types
└── utils/            # Utility functions
```

## State Management

- Use `useState` for local state
- Use `useReducer` for complex local state
- Use context sparingly — only for truly global state (theme, auth)
- For server state, use React Query / TanStack Query
- Avoid prop drilling >2 levels — use composition or context

## Hooks

- Custom hooks start with `use` prefix
- Extract reusable logic into custom hooks
- Follow Rules of Hooks — only call at top level
- Use `useMemo` and `useCallback` only when profiling shows a need

## Performance

- Use `React.lazy` and `Suspense` for code splitting
- Use `React.memo` only for expensive renders (measure first)
- Avoid inline object/array creation in JSX props
- Use virtual scrolling for large lists (`react-window`)

## Testing

- Use React Testing Library — test behavior, not implementation
- Query by role, label, or text — not by test ID or class name
- Test user interactions, not component internals
- Use `msw` for API mocking

## Accessibility

- Use semantic HTML elements (`button`, `nav`, `main`, not `div` for everything)
- Add `aria-label` for icon-only buttons
- Ensure keyboard navigation works
- Test with screen reader
- Color contrast ≥4.5:1

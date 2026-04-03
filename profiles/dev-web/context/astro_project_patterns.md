# Astro Project Patterns

## Page Template

```astro
---
// src/pages/dashboard.astro
import Layout from '../layouts/Layout.astro';
import DashboardPanel from '../components/DashboardPanel';

const data = await fetch('/api/dashboard').then(r => r.json());
---

<Layout title="Dashboard">
  <DashboardPanel client:load data={data} />
</Layout>
```

Common mistakes:
- Forgetting `client:*` directive — component renders as static HTML only
- Using `client:load` for everything — use `client:visible` for below-fold content
- Putting client-side logic in the frontmatter block (runs server-side only)

## React Component Template

```tsx
// src/components/UserCard.tsx
import { type FC } from 'react';

interface UserCardProps {
  name: string;
  email: string;
}

export const UserCard: FC<UserCardProps> = ({ name, email }) => {
  return (
    <wdpr-card>
      <h3>{name}</h3>
      <p>{email}</p>
    </wdpr-card>
  );
};
```

## Server Action Template

```typescript
// src/actions/getUsers.ts
import type { APIContext } from 'astro';

export async function getUsers(context: APIContext) {
  const token = context.request.headers.get('Authorization');
  try {
    const response = await fetch('https://api.example.com/users', {
      headers: { Authorization: token ?? '' },
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

## State Management

Two approaches:
1. **Nanostores** — Cross-component shared state (preferred for global state)
2. **React hooks** — Component-local or feature-scoped state

```typescript
// src/stores/userStore.ts
import { atom, computed } from 'nanostores';

export const $users = atom<User[]>([]);
export const $userCount = computed($users, users => users.length);
```

## Styling Priority

1. **Vista Web Components** — Always first choice for UI elements
2. **Tailwind** — Layout, spacing, responsive utilities
3. **CSS Modules** — Custom styles when Vista doesn't cover the need
4. **Inline styles** — Never (except dynamic computed values)

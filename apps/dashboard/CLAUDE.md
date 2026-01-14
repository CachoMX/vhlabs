# Claude Code Instructions - VH Labs Dashboard

This file provides instructions for AI assistants (like Claude) working on ongoing development of this dashboard.

## Project Context

This is a React admin dashboard for the VH Labs AI Investor Engagement Platform. It follows **Bulletproof React** architecture with strict separation of concerns.

### Key Principles
1. **Feature-based architecture**: Code is organized by feature, not by file type
2. **Unidirectional dependencies**: `shared → features → app`
3. **No cross-feature imports**: Features cannot import from each other
4. **Type safety**: Strict TypeScript with generated Supabase types
5. **Component composition**: Features are composed at the app layer only

## Architecture Rules (MUST FOLLOW)

### Dependency Flow
```
components/hooks/lib/types/utils → features → app
```

### What CAN import from what
- ✅ **Features** can import from: `components/`, `hooks/`, `lib/`, `types/`, `utils/`
- ✅ **App layer** can import from: `features/`, `components/`, `hooks/`, `lib/`, `types/`, `utils/`
- ❌ **Shared folders** CANNOT import from: `features/` or `app/`
- ❌ **Features** CANNOT import from: other features or `app/`

### ESLint Enforcement
The `.eslintrc.cjs` file enforces these rules. DO NOT bypass or disable these rules.

## Adding New Features

When adding a new feature module, follow this checklist:

### 1. Create Feature Folder Structure
```
src/features/[feature-name]/
├── api/                # TanStack Query hooks
├── components/         # Feature-specific components
├── hooks/              # Feature-specific hooks (optional)
├── stores/             # Feature-specific stores (optional)
├── types/              # Feature-specific types (optional)
├── utils/              # Feature-specific utilities (optional)
└── index.ts            # Public API exports
```

### 2. API Layer Pattern
```typescript
// src/features/[feature]/api/get-[entity].ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type Entity = Database['public']['Tables']['[table]']['Row'];

export const useGet[Entity] = () => {
  return useQuery({
    queryKey: ['[entity]'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('[table]')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
};
```

### 3. Component Pattern
```typescript
// src/features/[feature]/components/[Component]/[Component].tsx
import { useGet[Entity] } from '../../api/get-[entity]';
import { Card, Button } from '@/components/ui';

export function [Component]() {
  const { data, isLoading, error } = useGet[Entity]();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Card>
      {/* Component UI */}
    </Card>
  );
}
```

### 4. Public API Export
```typescript
// src/features/[feature]/index.ts
export { [Component] } from './components/[Component]/[Component]';
export { useGet[Entity] } from './api/get-[entity]';
export type { [Types] } from './types';
```

### 5. Route Integration
```typescript
// src/app/routes/[feature].tsx
import { PageContainer, PageHeader } from '@/components';
import { [Component] } from '@/features/[feature]';

export function [Feature]Route() {
  return (
    <PageContainer>
      <PageHeader title="[Title]" />
      <[Component] />
    </PageContainer>
  );
}

// Add to src/app/routes/index.tsx
import { [Feature]Route } from './[feature]';

// Add inside <Routes>
<Route
  path="/[feature]"
  element={
    <ProtectedRoute>
      <Layout>
        <[Feature]Route />
      </Layout>
    </ProtectedRoute>
  }
/>
```

### 6. Update Sidebar Navigation
```typescript
// src/components/Sidebar.tsx
import { [Icon] } from 'lucide-react';

const navigation = [
  // ... existing routes
  { name: '[Feature]', to: '/[feature]', icon: [Icon] },
];
```

## Common Tasks

### Adding a New Table Query
1. Add API hook in `features/[feature]/api/`
2. Use TanStack Query with proper query key
3. Use Supabase client from `@/lib/supabase`
4. Use database types from `@/types/database.types`

### Creating a New Component
1. **Shared component**: Add to `src/components/` or `src/components/ui/`
2. **Feature component**: Add to `src/features/[feature]/components/`
3. Use TypeScript with proper types
4. Export from appropriate `index.ts`

### Adding Form Validation
1. Use React Hook Form + Zod
2. Define schema in component file or types file
3. Example:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Adding a Mutation
```typescript
// src/features/[feature]/api/update-[entity].ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useUpdate[Entity] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateData) => {
      const { data: result, error } = await supabase
        .from('[table]')
        .update(data)
        .eq('id', data.id);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['[entity]'] });
    },
  });
};
```

## Code Style Guidelines

### File Naming
- **Components**: `PascalCase.tsx` (e.g., `ContentList.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- **API files**: `kebab-case.ts` (e.g., `get-contents.ts`, `update-prompt.ts`)
- **Utils**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Types**: `kebab-case.ts` (e.g., `content.types.ts`)

### Import Order
```typescript
// 1. External dependencies
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal imports using path aliases
import { Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/utils/format';

// 3. Types
import type { Database } from '@/types/database.types';

// 4. Relative imports (only within same feature)
import { useGetContents } from '../../api/get-contents';
```

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
}

// 3. Constants (outside component)
const MAX_ITEMS = 10;

// 4. Component definition
export function Component({ title }: ComponentProps) {
  // Hooks
  const [state, setState] = useState();

  // Derived state
  const count = state.length;

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## Working with Supabase

### Reading Data
```typescript
const { data } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value')
  .order('created_at', { ascending: false });
```

### Writing Data
```typescript
const { data } = await supabase
  .from('table_name')
  .insert({ column: 'value' });
```

### Updating Data
```typescript
const { data } = await supabase
  .from('table_name')
  .update({ column: 'new_value' })
  .eq('id', id);
```

### Using Views
```typescript
const { data } = await supabase
  .from('v_view_name')
  .select('*');
```

## Debugging

### TypeScript Errors
1. Run `npm run type-check` for full error output
2. Check that imports use path aliases
3. Verify types exist in `@/types/database.types`

### ESLint Errors
1. Run `npm run lint` to see all errors
2. Common issue: cross-feature imports (fix: move code to shared folder)
3. Run `npm run lint:fix` for auto-fixes

### Build Errors
1. Check all imports are correct
2. Verify environment variables in `.env`
3. Run `npm run type-check` first to isolate TypeScript issues

## Testing

### Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Hook Tests
```typescript
import { renderHook } from '@testing-library/react';
import { useCustomHook } from './useCustomHook';

describe('useCustomHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe('expected');
  });
});
```

## Best Practices

1. **Keep features isolated**: If code is used by multiple features, move it to shared folders
2. **Use TanStack Query**: Don't manage server state manually
3. **Type everything**: Use TypeScript strictly
4. **Small components**: Break down large components into smaller ones
5. **Semantic HTML**: Use proper HTML elements for accessibility
6. **Error handling**: Always handle loading and error states
7. **Consistent patterns**: Follow existing patterns in the codebase

## When to Create New Shared Components

Move component to `src/components/` when:
1. Used by 2+ features
2. Generic/reusable (not feature-specific)
3. Part of design system (buttons, inputs, cards, etc.)

Keep in feature when:
1. Only used by one feature
2. Contains feature-specific logic
3. Tightly coupled to feature data structures

## Performance Optimization

### Query Optimization
```typescript
useQuery({
  queryKey: ['entity', id],
  queryFn: fetchEntity,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### Lazy Loading
```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Common Pitfalls to Avoid

1. ❌ Don't import from another feature
2. ❌ Don't bypass ESLint rules
3. ❌ Don't use `any` type
4. ❌ Don't forget loading/error states
5. ❌ Don't mutate props
6. ❌ Don't use index as key in lists (use unique IDs)
7. ❌ Don't forget to invalidate queries after mutations

## Resources

- [Bulletproof React Guide](https://github.com/alan2207/bulletproof-react)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Getting Help

When stuck:
1. Check existing similar features for patterns
2. Run `npm run type-check` for TypeScript errors
3. Run `npm run lint` for architecture violations
4. Check Supabase logs for database errors
5. Review TanStack Query DevTools for query status

Remember: **This architecture exists to maintain scalability and maintainability. Follow it strictly.**

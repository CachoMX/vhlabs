# VH Labs Admin Dashboard

A React admin dashboard for managing the AI-driven investor engagement platform. Built with TypeScript, React 18, and follows the **Bulletproof React** architecture.

## Overview

This dashboard provides visibility and control over:
- **Content Pipeline**: Monitor and manage AI-processed content from calls/workshops
- **Distributions**: Track multi-channel distribution performance (email, SMS, social)
- **Contacts**: View contact segments, engagement metrics, and touchpoints
- **AI Prompts**: Manage and version AI prompts across all systems
- **Analytics**: View event logs and workflow execution status

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | React 18 + TypeScript | UI framework with strict typing |
| **Build Tool** | Vite | Fast builds and dev server |
| **Routing** | React Router v6 | Client-side routing |
| **State Management** | TanStack Query + Zustand | Server state + minimal client state |
| **Forms** | React Hook Form + Zod | Form handling with validation |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Charts** | Recharts | Data visualization |
| **Tables** | TanStack Table | Powerful data tables |
| **Icons** | Lucide React | Icon library |
| **Backend** | Supabase | Database + Authentication |
| **Testing** | Vitest + React Testing Library | Unit and integration tests |
| **Linting** | ESLint + Prettier | Code quality and formatting |

## Project Structure

Following **Bulletproof React** architecture:

```
dashboard/
├── public/                      # Static assets
├── src/
│   ├── app/                     # Application layer (compose features)
│   │   ├── routes/              # Route components
│   │   ├── app.tsx              # Root component
│   │   ├── provider.tsx         # Global providers (React Query, Router)
│   │   └── router.tsx           # Router configuration
│   ├── assets/                  # Images, fonts, icons
│   ├── components/              # Shared/reusable components
│   │   ├── ui/                  # Base UI components (Button, Input, Modal, etc.)
│   │   ├── Layout.tsx           # Main layout with sidebar
│   │   ├── DataTable.tsx        # Reusable data table
│   │   └── ...                  # Other shared components
│   ├── config/                  # Configuration (env variables)
│   ├── features/                # Feature-based modules (CORE)
│   │   ├── auth/                # Authentication
│   │   ├── dashboard/           # Dashboard home
│   │   ├── content/             # Content pipeline
│   │   ├── distributions/       # Distribution metrics
│   │   ├── contacts/            # Contact management
│   │   ├── prompts/             # AI prompt library
│   │   └── analytics/           # Event logs and workflows
│   ├── hooks/                   # Shared custom hooks
│   ├── lib/                     # Pre-configured libraries (supabase, react-query)
│   ├── stores/                  # Global Zustand stores
│   ├── testing/                 # Test utilities and mocks
│   ├── types/                   # Shared TypeScript types
│   ├── utils/                   # Utility functions
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── .env.example                 # Environment variables template
├── package.json
├── tsconfig.json                # TypeScript config with path aliases
├── vite.config.ts               # Vite config
├── tailwind.config.js           # Tailwind config
├── .eslintrc.cjs                # ESLint with architecture boundary rules
└── README.md
```

## Feature Module Structure

Each feature follows this structure (only create what's needed):

```
features/[feature-name]/
├── api/                # TanStack Query hooks for API calls
│   └── [name].ts       # e.g., get-contents.ts, update-prompt.ts
├── components/         # Feature-specific components
│   └── [Name]/
│       ├── [Name].tsx
│       └── [Name].test.tsx
├── hooks/              # Feature-specific hooks
├── stores/             # Feature-specific Zustand stores
├── types/              # Feature-specific TypeScript types
├── utils/              # Feature-specific utilities
└── index.ts            # Public API (exports only what's needed)
```

## Architecture Rules (CRITICAL)

### 1. No Cross-Feature Imports
Features **MUST NOT** import from other features. They are composed together only at the `app` layer.

### 2. Unidirectional Dependency Flow
```
shared (components/hooks/lib/types/utils) → features → app
```

**Rules**:
- ✅ Features can import from shared folders
- ✅ App can import from features + shared folders
- ❌ Shared folders CANNOT import from features or app
- ❌ Features CANNOT import from app
- ❌ Features CANNOT import from other features

### 3. ESLint Enforces Boundaries
The `.eslintrc.cjs` file enforces these rules with `import/no-restricted-paths`.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project with schema deployed

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (TypeScript check + build) |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint and auto-fix issues |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run type-check` | Run TypeScript type checking |

## Path Aliases

TypeScript and Vite are configured with these path aliases:

```typescript
@/*              → ./src/*
@/app/*          → ./src/app/*
@/assets/*       → ./src/assets/*
@/components/*   → ./src/components/*
@/config/*       → ./src/config/*
@/features/*     → ./src/features/*
@/hooks/*        → ./src/hooks/*
@/lib/*          → ./src/lib/*
@/stores/*       → ./src/stores/*
@/types/*        → ./src/types/*
@/utils/*        → ./src/utils/*
```

## Adding a New Feature

1. **Create feature folder**: `src/features/[feature-name]/`
2. **Add API layer** (if needed): Create TanStack Query hooks in `api/`
3. **Add components**: Create feature-specific components in `components/`
4. **Add types** (if needed): Create types in `types/index.ts`
5. **Export public API**: Export only what's needed in `index.ts`
6. **Compose in app layer**: Import and use in `src/app/routes/`

**Example**: Adding a "settings" feature

```typescript
// src/features/settings/api/get-settings.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useGetSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      return data;
    },
  });
};

// src/features/settings/components/SettingsView/SettingsView.tsx
import { useGetSettings } from '../../api/get-settings';

export function SettingsView() {
  const { data, isLoading } = useGetSettings();
  // Component implementation
}

// src/features/settings/index.ts
export { SettingsView } from './components/SettingsView/SettingsView';

// src/app/routes/settings.tsx
import { PageContainer, PageHeader } from '@/components';
import { SettingsView } from '@/features/settings';

export function SettingsRoute() {
  return (
    <PageContainer>
      <PageHeader title="Settings" />
      <SettingsView />
    </PageContainer>
  );
}

// Add route in src/app/routes/index.tsx
```

## Database Integration

The app connects to Supabase using generated TypeScript types in `src/types/database.types.ts`.

### Querying Data
```typescript
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type Content = Database['public']['Tables']['contents']['Row'];

const { data } = await supabase
  .from('contents')
  .select('*')
  .eq('status', 'ready');
```

### Using TanStack Query
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useGetContents = () => {
  return useQuery({
    queryKey: ['contents'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contents').select('*');
      if (error) throw error;
      return data;
    },
  });
};
```

## Authentication

Uses Supabase Auth with email/password.

### Login Flow
1. User enters email/password in `LoginForm` component
2. Calls `loginWithEmail` mutation from `@/features/auth`
3. On success, Supabase stores session in localStorage
4. User is redirected to dashboard

### Protected Routes
Wrap routes with `ProtectedRoute` component:

```typescript
import { ProtectedRoute } from '@/features/auth';

<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

## Testing

Run tests:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

### Writing Tests
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## Contributing

### Code Style
- **TypeScript**: Use strict mode
- **Components**: Named exports preferred (except default for routes)
- **Files**: PascalCase for components, camelCase for hooks/utils, kebab-case for API files
- **Imports**: Use path aliases (`@/components` not `../../components`)

### Before Committing
1. Run `npm run lint` (must pass)
2. Run `npm run type-check` (must pass)
3. Run `npm run test` (must pass)

## Troubleshooting

### Environment Variables Not Loading
- Make sure `.env` file exists in project root
- Restart dev server after changing `.env`
- Check that variables start with `VITE_`

### Import Errors
- Verify path aliases in `tsconfig.json` and `vite.config.ts` match
- Check that you're not importing from another feature
- Run `npm run type-check` to see full error details

### Supabase Connection Issues
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase dashboard for project status
- Ensure database schema is deployed

## Resources

- [Bulletproof React](https://github.com/alan2207/bulletproof-react) - Architecture guide
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)

## License

Proprietary - VH Labs / Vixi Agency

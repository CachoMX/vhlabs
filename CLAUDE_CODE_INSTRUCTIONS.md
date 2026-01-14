# Claude Code Instructions - Austin CG Investor Platform Dashboard

You are Claude Code acting as a senior React/TypeScript architect.

## Goal
Create a new React app that STRICTLY follows the architecture + folder conventions from "Bulletproof React" (alan2207/bulletproof-react). Mirror its philosophy: feature-based modules, a clear app layer, shared folders, and import boundaries.

## Project Location
Save all files to: D:\Projects\austin-cg-investor-engine\apps\dashboard

## Context Files to Read
Before building, understand the project by reading:
1. `README.md` - Project overview and tech stack
2. `.taskmaster/docs/prd.txt` - Full specifications (search for "dashboard" and "Admin Dashboard")
3. `supabase/migrations/001_initial_schema.sql` - Database schema you'll connect to
4. `TASKS.md` - Look at Phase 4 (TASK-084 to TASK-088) for dashboard tasks

---

## 🎯 PROJECT DESCRIPTION (WHAT I WANT TO BUILD)

**App Name:** VH Labs Admin Dashboard

**Description:** 
An admin dashboard for managing an AI-driven investor engagement platform. Monitors content processing pipeline, tracks distribution metrics across email/SMS/social, manages AI prompts, and provides visibility into contact segmentation and engagement.

**Features to implement:**
1. auth - Simple admin authentication via Supabase Auth
2. dashboard - Home page with KPIs, recent activity, system health
3. content - Content pipeline management (view, filter, trigger processing, archive)
4. distributions - Distribution metrics and performance tracking
5. contacts - Contact overview with segmentation and engagement data
6. prompts - AI prompt library management (CRUD, versioning, testing)
7. analytics - Event logs and workflow monitoring

**Pages/Routes needed:**
- `/` - Dashboard home with KPIs, recent activity feed, system health
- `/login` - Admin login page
- `/content` - Content pipeline table with filters
- `/content/:id` - Content detail with hooks, clips, distribution history
- `/distributions` - Distribution metrics charts and tables
- `/contacts` - Contacts overview with segment/status filters
- `/prompts` - Prompt library management
- `/prompts/:id` - Prompt detail/edit view
- `/analytics` - Event logs and workflow status

**User roles (if any):**
- Admin: Full access to all features

**External APIs/Integrations (if any):**
- Supabase: Database and authentication (schema already defined)

**Additional requirements:**
- Supabase Auth (email/password for admin)
- Dark mode support (optional but nice)
- Mobile responsive (desktop-first)
- Use Supabase views: `v_content_ready`, `v_contact_overview`, `v_distribution_performance`

---

## Tech Stack (Required)
- React 18+ with TypeScript (strict mode)
- Vite as build tool
- React Router v6 (routing lives in src/app and/or src/app/routes)
- TanStack Query (React Query) for server state management
- Zustand for client state management (minimal - mostly server state)
- React Hook Form for forms
- Zod for validation/schemas
- Tailwind CSS for styling
- Recharts for charts/visualizations
- @tanstack/react-table for data tables
- Lucide React for icons
- @supabase/supabase-js + @supabase/ssr for Supabase client
- ESLint + Prettier (configured and passing)
- Vitest + React Testing Library for testing

## Hard Requirements (Must Follow Exactly)

### 1) Project Structure
Must match Bulletproof React's architecture:

```
dashboard/
├── public/
├── src/
│   ├── app/                    # Application layer
│   │   ├── routes/             # Route definitions
│   │   ├── app.tsx             # Main App component
│   │   ├── provider.tsx        # Global providers wrapper
│   │   └── router.tsx          # Router configuration
│   ├── assets/                 # Static files (images, fonts, icons)
│   ├── components/             # Shared/reusable UI components
│   │   └── ui/                 # Base UI components (Button, Input, Modal, etc.)
│   ├── config/                 # Global configuration, env variables
│   ├── features/               # Feature-based modules (CORE OF THE APP)
│   ├── hooks/                  # Shared custom hooks
│   ├── lib/                    # Pre-configured libraries (supabase, react-query, etc.)
│   ├── stores/                 # Global state stores
│   ├── testing/                # Test utilities and mocks
│   ├── types/                  # Shared TypeScript types/interfaces
│   ├── utils/                  # Shared utility functions
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles / Tailwind imports
├── .env.example                # Environment variables template
├── .eslintrc.cjs               # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration with path aliases
├── vite.config.ts              # Vite configuration
├── package.json
├── README.md
└── CLAUDE.md                   # AI assistant instructions for ongoing development
```

### 2) Feature Module Structure
For EACH feature listed in the Project Description, create this structure (only create subfolders that are actually needed):

```
src/features/[feature-name]/
├── api/              # API calls, TanStack Query hooks for this feature
│   └── [name].ts     # e.g., get-contents.ts, update-prompt.ts
├── components/       # Components scoped to this feature only
│   └── [name]/       # Each component in its own folder
│       ├── [name].tsx
│       └── [name].test.tsx
├── hooks/            # Custom hooks specific to this feature
├── stores/           # Feature-specific Zustand stores
├── types/            # TypeScript types for this feature
├── utils/            # Utility functions for this feature
└── index.ts          # Public API - exports only what other features can use
```

### 3) No Cross-Feature Imports (CRITICAL)
- Features MUST NOT import from other features
- Compose features together ONLY at the app layer (`src/app`)

### 4) Unidirectional Architecture (CRITICAL)
Enforce this dependency flow:
```
shared (components/hooks/lib/types/utils) → features → app
```

Rules:
- ✅ `features` can import from `shared folders`
- ✅ `app` can import from `features` + `shared folders`
- ❌ `shared folders` must NEVER import from `features` or `app`
- ❌ `features` must NEVER import from `app`
- ❌ `features` must NEVER import from other `features`

### 5) Path Aliases (Required in tsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/assets/*": ["./src/assets/*"],
      "@/components/*": ["./src/components/*"],
      "@/config/*": ["./src/config/*"],
      "@/features/*": ["./src/features/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  }
}
```

### 6) ESLint Boundary Rules (Required)
Configure `import/no-restricted-paths` to enforce architecture boundaries (block cross-feature imports, enforce unidirectional flow).

## File Naming Conventions
- Components: PascalCase (`ContentTable.tsx`)
- Hooks: camelCase with 'use' prefix (`useContents.ts`)
- API files: kebab-case (`get-contents.ts`, `update-prompt.ts`)
- Utils/helpers: camelCase (`formatDate.ts`)
- Types: kebab-case (`content.types.ts`)
- Stores: kebab-case (`ui.store.ts`)

## Component File Structure
```typescript
// 1. External imports
// 2. Internal imports (using path aliases)
// 3. Types/Interfaces
// 4. Constants
// 5. Component definition (named export)
```

---

## Feature-Specific Requirements

### Feature: auth
- Supabase Auth integration
- Login page with email/password
- Protected route wrapper component
- Auth state management

### Feature: dashboard
- KPI cards: Total content, distributions today, open rate, response rate
- Recent activity feed from `analytics_events` table
- System health: recent errors from `workflow_logs`
- Quick actions: Process pending content, view queue

### Feature: content
**List View (`/content`):**
- DataTable with columns: title, source_type, status, audiences (tags), score, priority, created_at
- Filters: status (pending/processing/ready/distributed/archived), priority (high/medium/low), audience
- Actions: View details, manually trigger processing, archive
- Pagination

**Detail View (`/content/:id`):**
- Full content record display
- Extracted hooks list (from `hooks` table)
- Clips with timestamps
- Distribution history for this content
- Edit metadata form

### Feature: distributions
- Use `v_distribution_performance` view for aggregate stats
- Charts (Recharts): 
  - Sends by channel (bar chart)
  - Open rates over time (line chart)
  - Response rates by segment (bar chart)
- Filter by date range, channel, audience
- Recent distributions table

### Feature: contacts
- DataTable from `v_contact_overview` view
- Columns: name, email, segment, status, score, last_touchpoint, touchpoint_count, response_count
- Filters: segment (dropdown), investor_status (dropdown), score range (slider)
- Click row to see contact detail modal

### Feature: prompts
**List View (`/prompts`):**
- Table: prompt_id, name, system, category, version, is_active, updated_at
- Filter by system (system1/system2/system3/system4), category
- Actions: Edit, Duplicate, Activate/Deactivate

**Detail/Edit View (`/prompts/:id`):**
- Form: name, description, category, content (large textarea)
- Variable highlighting in content (show `{variable}` in different color)
- Test prompt: input sample variables, show generated output
- Version history (list of versions for same prompt_id)
- Save creates new version

### Feature: analytics
- Event log table from `analytics_events`
- Filter by event_type, event_category, date range
- Workflow status from `workflow_logs`
- Error highlighting

---

## Database Types (Generate from Schema)

Key tables to type:
- `segments` - Audience segment definitions
- `investor_statuses` - Contact status taxonomy
- `prompts` - AI prompt library
- `contents` - Content records
- `hooks` - Extracted hooks
- `contacts_sync` - Contact mirror from GHL
- `distributions` - Send tracking
- `touchpoint_queue` - Scheduled sends
- `analytics_events` - Event log
- `workflow_logs` - n8n workflow tracking
- `templates` - Message templates

Key views:
- `v_content_ready` - Content ready for distribution
- `v_contact_overview` - Contacts with stats
- `v_distribution_performance` - Aggregate metrics

---

## Shared UI Components to Build

Place in `src/components/ui/`:

1. **Button** - Primary, secondary, ghost, destructive variants
2. **Input** - Text input with label, error state
3. **Select** - Dropdown select
4. **Textarea** - Multi-line input
5. **Badge** - Status badges with color variants
6. **Card** - Container card
7. **DataTable** - Reusable table with sorting, filtering, pagination (use @tanstack/react-table)
8. **Modal** - Dialog/modal component
9. **Tabs** - Tab navigation
10. **Spinner** - Loading indicator
11. **EmptyState** - Empty data placeholder
12. **MetricCard** - KPI display card with icon, value, label, trend

Place in `src/components/`:

1. **Layout** - Main layout with sidebar navigation
2. **Sidebar** - Navigation sidebar
3. **Header** - Page header with title, actions
4. **PageContainer** - Consistent page wrapper
5. **ActivityFeed** - Recent events list
6. **StatusBadge** - Specific to content/distribution status
7. **AudienceTags** - Display audience segment tags

---

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Deliverables

1. **Generate all files and folders** for the features listed above

2. **Ensure these commands work:**
   - `npm install`
   - `npm run dev`
   - `npm run build`
   - `npm run lint` (passes with no errors)

3. **Include comprehensive README.md** explaining the project and how to add new features

4. **Include CLAUDE.md** with ongoing development instructions

5. **Include .env.example** with required environment variables

6. **Generate TypeScript types** matching the Supabase schema

## Output Format

1. First, print the complete final folder tree
2. Then, output the complete contents of EACH file
3. Do not omit any file required to run the app

## Start Now
Based on the Project Description above, create the complete application following Bulletproof React architecture. Do not ask clarifying questions - use sensible defaults for anything not specified.

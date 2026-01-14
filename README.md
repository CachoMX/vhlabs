# Austin CG - AI Investor Engagement Platform

A 4-system AI-driven platform for investor engagement, content processing, and multi-channel distribution.

## Project Overview

Built for Austin / CQ Marketing. Transforms calls and workshops into segmented, automated outreach.

### The 4 Systems

1. **AI Setter & Investor Intelligence Engine** - Parse notes, detect intent, segment contacts, personalized check-ins
2. **Content Intelligence & Processing Pipeline** - Slack intake, AI extraction, hook/clip identification
3. **Multi-Channel Distribution Engine** - Route content to 9 audience segments across email, SMS, social
4. **GHL Orchestration & Prompt Architecture** - Workflow foundation, prompt library, testing

## Tech Stack

| Layer | Technology |
|-------|------------|
| Orchestration | n8n (cloud.n8n.io) |
| CRM/Delivery | GoHighLevel |
| Database | Supabase |
| Custom UI | Next.js (optional dashboard) |
| AI | Claude API |

## Project Structure

```
austin-cg-investor-engine/
├── .taskmaster/
│   └── docs/
│       └── prd.txt              # Full PRD document
├── apps/
│   └── dashboard/               # Next.js admin dashboard (TBD)
├── ghl/                         # GHL configuration docs
├── n8n-workflows/               # Exported n8n workflow JSONs
├── prompts/
│   └── PROMPT_LIBRARY.md        # All AI prompts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── TASKS.md                     # Task breakdown
└── README.md
```

## Quick Start

### 1. Supabase Setup
```bash
# Create project at supabase.com
# Run migration
psql -h <host> -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql
```

### 2. n8n Setup
- Create workspace at cloud.n8n.io
- Configure credentials:
  - Supabase
  - GoHighLevel
  - Slack
  - Anthropic (Claude)

### 3. GHL Setup
- Create custom fields (see PRD)
- Create tags (9 segments + statuses)
- Configure API access

### 4. Slack Setup
- Create Slack App
- Enable reaction events
- Set webhook URL to n8n

## Documentation

- **PRD**: `.taskmaster/docs/prd.txt`
- **Tasks**: `TASKS.md`
- **Prompts**: `prompts/PROMPT_LIBRARY.md`
- **Schema**: `supabase/migrations/001_initial_schema.sql`

## Environment Variables

```env
# Supabase
SUPABASE_URL=
SUPABASE_KEY=

# GoHighLevel
GHL_API_KEY=
GHL_LOCATION_ID=

# Slack
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=

# AI
ANTHROPIC_API_KEY=

# Optional
CREATIFY_API_KEY=
INSTAGRAM_ACCESS_TOKEN=
```

## Open Questions for Austin

Before full implementation:

1. Call recording source? (GHL phone, Zoom, other?)
2. Workshop recording storage? (YouTube, Vimeo, local?)
3. Instagram Business API access?
4. Creatify subscription level?
5. Expected volume (contacts, content pieces)?
6. GHL account - new or existing?
7. Who is "Ashley" for tagging?
8. Timeline for Phase 1?

## Timeline

| Phase | Scope | Est. Hours |
|-------|-------|------------|
| 1 | Foundation | 40-60 |
| 2 | AI Processing | 30-40 |
| 3 | Distribution | 20-30 |
| 4 | Social/Cross-Promo | 15-25 |
| 5 | AI Setter | 20-25 |
| 6 | Testing/QA | 15-20 |
| 7 | White-Label (opt) | 10-15 |

**Total: 150-215 hours**

## Contact

- **Agency**: Vixi Agency
- **Lead**: Carlos
- **Client**: Austin / CQ Marketing

---

*Created: December 2024*

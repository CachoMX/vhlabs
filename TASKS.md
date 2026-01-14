# Project Tasks - Austin CG Investor Engagement Platform

## Phase 1: Foundation (40-60 hours)
**Goal**: Set up infrastructure and core data flows

### 1.1 Supabase Setup
- [ ] **TASK-001**: Create new Supabase project for Austin CG
- [ ] **TASK-002**: Run initial migration (001_initial_schema.sql)
- [ ] **TASK-003**: Configure Row Level Security policies
- [ ] **TASK-004**: Set up Supabase API keys and environment variables
- [ ] **TASK-005**: Seed segments and investor_statuses tables
- [ ] **TASK-006**: Import prompt library to prompts table
- [ ] **TASK-007**: Test Supabase connections from n8n

### 1.2 n8n Environment Setup
- [ ] **TASK-008**: Create n8n cloud workspace for project
- [ ] **TASK-009**: Configure environment variables:
  - SUPABASE_URL
  - SUPABASE_KEY
  - GHL_API_KEY
  - GHL_LOCATION_ID
  - SLACK_BOT_TOKEN
  - ANTHROPIC_API_KEY (or OPENAI_API_KEY)
- [ ] **TASK-010**: Create folder structure in n8n for 4 systems
- [ ] **TASK-011**: Build utility workflow: Error Logger
- [ ] **TASK-012**: Build utility workflow: Analytics Event Logger

### 1.3 GHL Audit & Configuration
- [ ] **TASK-013**: Get GHL account access from Austin
- [ ] **TASK-014**: Audit existing workflows (document what exists)
- [ ] **TASK-015**: Audit existing custom fields
- [ ] **TASK-016**: Audit existing tags
- [ ] **TASK-017**: Create required custom fields:
  - investor_status (dropdown)
  - segment (dropdown)
  - score (number)
  - last_ai_touchpoint (date)
  - content_preferences (multi-select)
- [ ] **TASK-018**: Create segment tags (9 tags)
- [ ] **TASK-019**: Create status tags (hot, warm, cold, dormant)
- [ ] **TASK-020**: Configure API access / get API key
- [ ] **TASK-021**: Test GHL API connection from n8n

### 1.4 Slack Integration Setup
- [ ] **TASK-022**: Get Slack workspace access
- [ ] **TASK-023**: Create Slack App for webhooks
- [ ] **TASK-024**: Configure reaction event subscriptions
- [ ] **TASK-025**: Set up webhook URL in n8n
- [ ] **TASK-026**: Test Slack → n8n webhook flow
- [ ] **TASK-027**: Create Ashley tagging SOP document
- [ ] **TASK-028**: Train Ashley on tagging process (coordinate with Austin)

### 1.5 Core Slack→n8n→Supabase Flow
- [ ] **TASK-029**: Build workflow: Slack Reaction Receiver
  - Receive webhook
  - Validate reaction is from approved users
  - Extract message content/link
  - Parse reaction to segment
  - Create content record in Supabase (status: pending)
  - Log event
- [ ] **TASK-030**: Test end-to-end Slack → Supabase flow
- [ ] **TASK-031**: Add error handling to workflow
- [ ] **TASK-032**: Document workflow

---

## Phase 2: AI Processing (30-40 hours)
**Goal**: Build intelligent content and contact processing

### 2.1 Note Parsing Workflow (System 1)
- [ ] **TASK-033**: Build workflow: Note Parser Trigger
  - Trigger: GHL webhook on contact update (notes field)
  - OR Manual trigger with contact ID
- [ ] **TASK-034**: Build workflow: Note Parser AI Node
  - Fetch contact from GHL
  - Get note_parser prompt from Supabase
  - Call Claude/GPT with notes
  - Parse JSON response
- [ ] **TASK-035**: Build workflow: Note Parser Update
  - Update Supabase contacts_sync with parsed data
  - Update GHL custom fields
  - Apply segmentation rules
  - Log analytics event
- [ ] **TASK-036**: Test note parser with 10 sample notes
- [ ] **TASK-037**: Refine prompt based on test results
- [ ] **TASK-038**: Document workflow

### 2.2 Content Extraction Agent (System 2)
- [ ] **TASK-039**: Build workflow: Content Processor Trigger
  - Trigger: Supabase webhook on new content (status = pending)
  - OR Manual trigger with content ID
- [ ] **TASK-040**: Build workflow: Transcript Acquisition
  - Check if transcript exists
  - If video/audio URL → call transcription API
  - Store raw transcript
- [ ] **TASK-041**: Build workflow: Transcript Cleaner
  - Get transcript_cleaner prompt
  - Clean transcript via AI
  - Store cleaned version
- [ ] **TASK-042**: Build workflow: Content Extraction AI
  - Get content_agent prompt
  - Process with Claude/GPT
  - Parse hooks, clips, metadata
  - Validate JSON structure
- [ ] **TASK-043**: Build workflow: Content Storage
  - Update content record with extracted data
  - Insert hooks into hooks table
  - Update status to 'ready'
  - Calculate content score
  - Log analytics
- [ ] **TASK-044**: Test content processor end-to-end
- [ ] **TASK-045**: Refine prompts based on results
- [ ] **TASK-046**: Document workflow

### 2.3 Segmentation Engine (System 1)
- [ ] **TASK-047**: Build workflow: Segmentation Rules Engine
  - Input: Contact data with parsed notes
  - Apply rules from PRD
  - Determine status changes
  - Return recommended segment + status
- [ ] **TASK-048**: Build workflow: Segment Updater
  - Update GHL contact tags
  - Update GHL custom fields
  - Sync to Supabase contacts_sync
  - Log change event
- [ ] **TASK-049**: Test segmentation with sample contacts
- [ ] **TASK-050**: Document rules and workflow

### 2.4 Contact Sync
- [ ] **TASK-051**: Build workflow: GHL → Supabase Contact Sync
  - Trigger: Scheduled (daily) or webhook
  - Fetch contacts from GHL
  - Upsert to contacts_sync
  - Update last_synced_at
- [ ] **TASK-052**: Build workflow: Supabase → GHL Sync
  - When Supabase contact updated
  - Push changes to GHL
- [ ] **TASK-053**: Test bidirectional sync
- [ ] **TASK-054**: Document sync process

---

## Phase 3: Distribution Engine (20-30 hours)
**Goal**: Route content to audiences across channels

### 3.1 Email Teaser Generation (System 3)
- [ ] **TASK-055**: Build workflow: Distribution Router
  - Input: Content ID (status = ready)
  - Get audience-to-channel routing rules
  - Create distribution queue entries
- [ ] **TASK-056**: Build workflow: Email Teaser Generator
  - For each distribution (channel = email)
  - Get teaser_generator prompt
  - Generate personalized email
  - Store in distribution record
- [ ] **TASK-057**: Create email templates in GHL
  - Hot lead teaser
  - General teaser
  - Follow-up reminder
- [ ] **TASK-058**: Build workflow: GHL Email Sender
  - Trigger: Distribution ready to send
  - Call GHL API to send email
  - Update distribution status
  - Store external_id
- [ ] **TASK-059**: Test email generation + sending
- [ ] **TASK-060**: Document workflow

### 3.2 SMS Distribution
- [ ] **TASK-061**: Build workflow: SMS Generator
  - Shorter format for SMS
  - Character limit handling
- [ ] **TASK-062**: Build workflow: GHL SMS Sender
  - Send via GHL API
  - Track delivery
- [ ] **TASK-063**: Test SMS flow
- [ ] **TASK-064**: Document workflow

### 3.3 Audience Routing Logic
- [ ] **TASK-065**: Implement routing rules from PRD
  - RE Investors → Email + Instagram
  - House Buyers → SMS + Email
  - Bird Doggers → Email + Slack
  - (etc. - all 9 segments)
- [ ] **TASK-066**: Build multi-channel distribution coordinator
- [ ] **TASK-067**: Test routing with sample content
- [ ] **TASK-068**: Document routing rules

### 3.4 Sequence Triggers
- [ ] **TASK-069**: Build workflow: Follow-up Scheduler
  - Day 3 follow-up if no open
  - Day 3 different follow-up if opened no click
  - Day 7 related content
- [ ] **TASK-070**: Build workflow: Sequence Executor
  - Check conditions
  - Generate follow-up content
  - Send via appropriate channel
- [ ] **TASK-071**: Test sequence flows
- [ ] **TASK-072**: Document sequences

---

## Phase 4: Social & Cross-Promotion (15-25 hours)
**Goal**: Instagram automation and cross-channel amplification

### 4.1 Instagram Integration (System 3)
- [ ] **TASK-073**: Verify Instagram Business API access
- [ ] **TASK-074**: Set up Instagram Graph API credentials
- [ ] **TASK-075**: Build workflow: Instagram Caption Generator
  - Get instagram_caption prompt
  - Generate caption with hashtags
- [ ] **TASK-076**: Build workflow: Instagram Poster
  - Upload media (or use existing URL)
  - Post via API
  - Store post ID + URL
- [ ] **TASK-077**: Test Instagram posting
- [ ] **TASK-078**: Document Instagram workflow
- [ ] **TASK-079**: Handle Instagram API limitations/fallbacks

### 4.2 Cross-Promotion Logic
- [ ] **TASK-080**: Build workflow: Cross-Promo Trigger
  - When Instagram post goes live
  - Update email with Instagram link
- [ ] **TASK-081**: Build workflow: Engagement-Based Routing
  - If email opened no click → Instagram nudge
  - If high IG engagement → boost email priority
- [ ] **TASK-082**: Test cross-promotion flows
- [ ] **TASK-083**: Document cross-promotion logic

### 4.3 Analytics Dashboard (Basic)
- [ ] **TASK-084**: Define dashboard requirements
- [ ] **TASK-085**: Create Supabase views for dashboard data
- [ ] **TASK-086**: Build Next.js dashboard (Claude Code)
  - Content pipeline view
  - Distribution metrics
  - Engagement stats
- [ ] **TASK-087**: Deploy dashboard
- [ ] **TASK-088**: Document dashboard

---

## Phase 5: AI Setter & Touchpoints (20-25 hours)
**Goal**: Automated personalized outreach

### 5.1 Setter Message Generation
- [ ] **TASK-089**: Build workflow: Touchpoint Scheduler
  - Cron trigger (daily)
  - Query contacts due for touchpoint
  - Based on segment frequency rules
  - Add to touchpoint_queue
- [ ] **TASK-090**: Build workflow: Setter Message Generator
  - For each queued touchpoint
  - Get appropriate setter prompt (based on status)
  - Generate personalized message
  - Store in queue
- [ ] **TASK-091**: Build workflow: Setter Message Sender
  - Process queue
  - Send via GHL (SMS or email)
  - Update distribution tracking
  - Update contact last_touchpoint_at
- [ ] **TASK-092**: Test setter flows with sample contacts
- [ ] **TASK-093**: Refine prompts based on message quality
- [ ] **TASK-094**: Document setter system

### 5.2 Response Handling
- [ ] **TASK-095**: Build workflow: Response Receiver
  - GHL webhook on message reply
  - Fetch original message context
- [ ] **TASK-096**: Build workflow: Response Classifier
  - Get response_classifier prompt
  - Classify reply
  - Determine action
- [ ] **TASK-097**: Build workflow: Response Router
  - If interested → update status, notify team
  - If question → queue for AI response or human
  - If objection → update status, trigger content
  - If unsubscribe → stop automation
- [ ] **TASK-098**: Build workflow: Auto-Response Generator
  - For simple questions
  - Generate helpful response
  - Human review queue option
- [ ] **TASK-099**: Test response handling
- [ ] **TASK-100**: Document response workflows

---

## Phase 6: Testing, QA & Documentation (15-20 hours)
**Goal**: Ensure reliability and prepare for handoff

### 6.1 Testing
- [ ] **TASK-101**: Create test data set
  - 20 sample contacts
  - 5 sample content pieces
  - 10 sample call notes
- [ ] **TASK-102**: Unit test each AI prompt (10 samples each)
- [ ] **TASK-103**: Integration test: Slack → Content → Distribution
- [ ] **TASK-104**: Integration test: Note → Segment → Touchpoint
- [ ] **TASK-105**: Integration test: Response → Classification → Action
- [ ] **TASK-106**: Load test: 100 contacts, 10 content pieces
- [ ] **TASK-107**: Document test results and issues

### 6.2 Error Handling & Monitoring
- [ ] **TASK-108**: Add error notifications (Slack/email on failure)
- [ ] **TASK-109**: Create monitoring dashboard
- [ ] **TASK-110**: Set up alerts for:
  - Workflow failures
  - API rate limits
  - Deliverability issues
- [ ] **TASK-111**: Document error handling procedures

### 6.3 Documentation
- [ ] **TASK-112**: Update PRD with any changes
- [ ] **TASK-113**: Document all n8n workflows (export + descriptions)
- [ ] **TASK-114**: Document Supabase schema (ER diagram)
- [ ] **TASK-115**: Document GHL configuration
- [ ] **TASK-116**: Create operational SOP:
  - Daily checks
  - Weekly reviews
  - Monthly optimization
- [ ] **TASK-117**: Create troubleshooting guide
- [ ] **TASK-118**: Create Ashley tagging guide (final version)

### 6.4 Handoff
- [ ] **TASK-119**: Export all n8n workflows as JSON
- [ ] **TASK-120**: Export Supabase schema
- [ ] **TASK-121**: Compile all documentation
- [ ] **TASK-122**: Create environment variable template
- [ ] **TASK-123**: Record walkthrough video
- [ ] **TASK-124**: Handoff meeting with Austin
- [ ] **TASK-125**: Begin 30-day support period

---

## Phase 7: White-Label Prep (Optional - 10-15 hours)
**Goal**: Prepare for Prop.AI or other partner deployment

### 7.1 Templating
- [ ] **TASK-126**: Create configurable brand variables
- [ ] **TASK-127**: Template email designs
- [ ] **TASK-128**: Template dashboard branding
- [ ] **TASK-129**: Document customization points

### 7.2 Deployment Guide
- [ ] **TASK-130**: Write partner deployment guide
- [ ] **TASK-131**: Create environment setup checklist
- [ ] **TASK-132**: Test deployment with fresh accounts
- [ ] **TASK-133**: Document per-partner costs (APIs, etc.)

---

## Dependencies Map

```
TASK-001 → TASK-002 → TASK-005 → TASK-006
                    → TASK-007 → TASK-029

TASK-008 → TASK-009 → TASK-010 → TASK-011
                              → TASK-029

TASK-013 → TASK-014 → TASK-017 → TASK-021 → TASK-029
         → TASK-020 ─────────────────────────┘

TASK-022 → TASK-023 → TASK-025 → TASK-029

TASK-029 → TASK-039 → TASK-040 → TASK-042 → TASK-055

TASK-033 → TASK-047 → TASK-089 → TASK-095
```

---

## Priority Matrix

### P0 - Must Have (MVP)
- Supabase setup
- n8n environment
- GHL connection
- Slack intake
- Basic content processing
- Email distribution
- Note parsing

### P1 - Should Have
- Full AI extraction
- All segment routing
- Setter system
- Response handling
- Basic dashboard

### P2 - Nice to Have
- Instagram automation
- Cross-promotion
- Advanced analytics
- White-label prep

---

## Time Estimates by Phase

| Phase | Hours | Dependencies |
|-------|-------|--------------|
| 1. Foundation | 40-60 | None |
| 2. AI Processing | 30-40 | Phase 1 |
| 3. Distribution | 20-30 | Phase 1, 2 |
| 4. Social/Cross-Promo | 15-25 | Phase 3 |
| 5. AI Setter | 20-25 | Phase 2, 3 |
| 6. Testing/QA | 15-20 | All above |
| 7. White-Label | 10-15 | Phase 6 |

**Total: 150-215 hours**

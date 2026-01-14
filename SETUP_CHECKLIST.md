# Austin CG Investor Platform - Setup Checklist

## Current Status
- [x] Project scaffolded
- [x] PRD documented
- [x] Database schema created
- [x] Supabase tables created
- [ ] Prompts seeded
- [ ] Functions deployed
- [ ] n8n workflows imported
- [ ] GHL configured
- [ ] Slack app created
- [ ] End-to-end test

---

## Step 1: Supabase Setup ✅ (Partially Complete)

### 1.1 Tables Created ✅
You've already run `001_initial_schema.sql`

### 1.2 Seed Prompts (DO THIS NOW)
Run in Supabase SQL Editor:
```
supabase/migrations/002_seed_prompts.sql
```

This creates 10 AI prompts:
- setter_update_base
- setter_hot_lead
- setter_dormant_reengagement
- setter_objection_response
- note_parser
- response_classifier
- content_agent
- transcript_cleaner
- teaser_generator
- instagram_caption

### 1.3 Deploy Functions (DO THIS NOW)
Run in Supabase SQL Editor:
```
supabase/migrations/003_functions_and_indexes.sql
```

This creates:
- `get_contacts_due_for_touchpoint()` - For touchpoint scheduler
- `get_content_ready_for_distribution()` - For distribution router
- `get_distribution_stats()` - For dashboard
- `calculate_content_score()` - For content scoring
- Auto-update triggers
- Performance indexes

### 1.4 Verify Setup
Run this query to confirm:
```sql
-- Check prompts
SELECT prompt_id, name, is_active FROM prompts;

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' AND routine_schema = 'public';

-- Check segments seeded
SELECT slug, name, channel_primary FROM segments;

-- Check investor statuses seeded
SELECT slug, name, touchpoint_frequency_days FROM investor_statuses;
```

### 1.5 Get Your Keys
From Supabase Dashboard → Settings → API:
- `SUPABASE_URL`: https://xxxxx.supabase.co
- `SUPABASE_KEY`: Service role key (not anon key!)

---

## Step 2: n8n Setup

### 2.1 Create Workspace
Go to [cloud.n8n.io](https://cloud.n8n.io)

### 2.2 Set Environment Variables
Settings → Variables:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Service role key |
| `GHL_API_KEY` | From GHL Settings |
| `GHL_LOCATION_ID` | From GHL URL |
| `ANTHROPIC_API_KEY` | From Anthropic Console |
| `SLACK_ALERTS_CHANNEL` | `#austin-cg-alerts` |

### 2.3 Create Folders
```
📁 Austin CG
├── 📁 System 1 - AI Setter
├── 📁 System 2 - Content Pipeline
├── 📁 System 3 - Distribution
├── 📁 System 4 - Orchestration
└── 📁 Utilities
```

### 2.4 Import Workflows (In This Order)

**Utilities First:**
1. `S4-01_error_logger.json` → Utilities
2. `S4-02_analytics_logger.json` → Utilities
3. `S4-03_ghl_contact_sync.json` → System 4

**System 1 - AI Setter:**
4. `S1-02_segmentation_engine.json` → System 1
5. `S1-01_note_parser.json` → System 1
6. `S1-03_touchpoint_scheduler.json` → System 1
7. `S1-04_setter_message_generator.json` → System 1
8. `S1-05_setter_message_sender.json` → System 1
9. `S1-06_response_handler.json` → System 1

**System 2 - Content Pipeline:**
10. `S2-03_transcript_processor.json` → System 2
11. `S2-02_content_processor.json` → System 2
12. `S2-01_slack_intake.json` → System 2

**System 3 - Distribution:**
13. `S3-02_email_generator.json` → System 3
14. `S3-03_email_sender.json` → System 3
15. `S3-04_instagram_poster.json` → System 3
16. `S3-01_distribution_router.json` → System 3

### 2.5 Link Workflow References
After importing, connect "Execute Workflow" nodes:

| In Workflow | Node | Link To |
|-------------|------|---------|
| S1-01 | "Call Segmentation Engine" | S1-02 |
| S1-03 | "Trigger Message Generator" | S1-04 |
| S1-04 | "Trigger Sender Workflow" | S1-05 |
| S2-01 | "Trigger Content Processor" | S2-02 |
| S2-01 | "Log Analytics Event" | S4-02 |
| S3-01 | "Trigger Email Generator" | S3-02 |
| S3-01 | "Trigger SMS Sender" | S1-05 (reuse) |
| S3-01 | "Trigger Instagram Poster" | S3-04 |
| S3-02 | "Trigger Email Sender" | S3-03 |

### 2.6 Activate Workflows
1. Activate utilities first (S4-01, S4-02, S4-03)
2. Activate in dependency order
3. Note webhook URLs for S2-01 and S1-01

---

## Step 3: Slack App Setup

### 3.1 Create App
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create New App → From scratch
3. Name: `Austin CG Content Bot`

### 3.2 OAuth Scopes
Bot Token Scopes:
- `channels:history`
- `reactions:read`
- `chat:write`

### 3.3 Event Subscriptions
Enable Events → Request URL:
```
https://[your-n8n-instance].app.n8n.cloud/webhook/slack-reaction
```

Subscribe to bot events:
- `reaction_added`

### 3.4 Install & Invite
1. Install to Workspace
2. Copy Bot User OAuth Token
3. In Slack channel: `/invite @Austin CG Content Bot`

### 3.5 Train Team on Reactions
| Emoji | Segment |
|-------|---------|
| 🏠 | RE Investors |
| 🏡 | House Buyers |
| 🐶 | Bird Doggers |
| 🤝 | JV Partners |
| 📚 | Coaching Students |
| 💰 | Wholesalers |
| 🏦 | Lenders |
| 📝 | Sellers |
| ❓ | General |
| 🔥 | HIGH PRIORITY |
| ⭐ | Featured |

---

## Step 4: GHL Configuration

### 4.1 Get API Credentials
Settings → API:
- Copy API Key
- Note Location ID from URL

### 4.2 Create Custom Fields
Contacts → Settings → Custom Fields:
- `investor_status` (Dropdown)
- `segment` (Dropdown)

### 4.3 Set Up Webhooks
Settings → Webhooks:

| Event | URL |
|-------|-----|
| Contact Updated | `https://[n8n]/webhook/ghl-note-update` |
| Inbound Message | `https://[n8n]/webhook/ghl-reply` |

### 4.4 Configure Email Sending
- Verify sending domain
- Set up DKIM/SPF/DMARC
- Create email template (optional)

---

## Step 5: Testing

### 5.1 Test Slack Intake
1. Post message with video link in Slack channel
2. Add 🏠 reaction
3. Check n8n execution logs
4. Verify record in Supabase `contents` table

### 5.2 Test Note Parser
1. Update contact notes in GHL
2. Check n8n execution
3. Verify `contacts_sync` updated

### 5.3 Test Distribution
1. Manually trigger S3-01 with content_id
2. Check distribution records created
3. Verify emails queued

---

## Environment Variables Summary

### n8n Variables
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
GHL_API_KEY=xxxxxxxx
GHL_LOCATION_ID=xxxxxxxx
GHL_FROM_EMAIL=updates@yourdomain.com
GHL_FROM_NAME=Austin's Team
ANTHROPIC_API_KEY=sk-ant-xxxxx
SLACK_ALERTS_CHANNEL=#austin-cg-alerts
INSTAGRAM_ACCESS_TOKEN=(optional)
INSTAGRAM_BUSINESS_ID=(optional)
```

---

## Webhook URLs (After Setup)

| System | Webhook | Purpose |
|--------|---------|---------|
| S2-01 | `/slack-reaction` | Slack content intake |
| S1-01 | `/ghl-note-update` | GHL note parsing |
| S1-06 | `/ghl-reply` | GHL reply handling |
| S3-01 | `/distribute-content` | Manual distribution trigger |

---

## Next Steps After Setup

1. ✅ Run prompt seed SQL
2. ✅ Run functions SQL
3. ⬜ Configure n8n environment
4. ⬜ Import all 16 workflows
5. ⬜ Create Slack app
6. ⬜ Configure GHL webhooks
7. ⬜ Test Slack → n8n → Supabase flow
8. ⬜ Test GHL → n8n → Supabase flow
9. ⬜ Schedule call with Austin to demo

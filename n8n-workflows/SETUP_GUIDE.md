# n8n Setup Guide - Austin CG

## Quick Start

### 1. Create n8n Cloud Workspace
1. Go to [cloud.n8n.io](https://cloud.n8n.io)
2. Create new workspace or use existing
3. Note your webhook base URL (e.g., `https://your-instance.app.n8n.cloud/webhook/`)

### 2. Set Up Environment Variables

Go to **Settings → Variables** and create:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase dashboard |
| `SUPABASE_KEY` | `eyJhbGc...` | Service role key (not anon) |
| `GHL_API_KEY` | `xxxxxxxx` | From GHL Settings → API |
| `GHL_LOCATION_ID` | `xxxxxxxx` | From GHL URL |
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxx` | From Anthropic console |
| `SLACK_ALERTS_CHANNEL` | `#austin-cg-alerts` | For error notifications |

### 3. Set Up Credentials

Go to **Credentials** and create:

#### Supabase (HTTP Header Auth)
- Name: `supabase_austin_cg`
- Header Name: `apikey`
- Header Value: `<your SUPABASE_KEY>`

#### Slack OAuth2
- Name: `slack_austin_cg`
- Get from Slack App (see Slack Setup below)

### 4. Create Folder Structure

In n8n, create folders:
```
📁 Austin CG
├── 📁 System 1 - AI Setter
├── 📁 System 2 - Content Pipeline
├── 📁 System 3 - Distribution
├── 📁 System 4 - Orchestration
└── 📁 Utilities
```

### 5. Import Workflows

**Import Order** (dependencies matter):

1. **Utilities first:**
   - `S4-01_error_logger.json` → Utilities folder
   - `S4-02_analytics_logger.json` → Utilities folder

2. **System 2 (Content Pipeline):**
   - `S2-02_content_processor.json` → System 2 folder
   - `S2-01_slack_intake.json` → System 2 folder (links to S2-02)

3. **System 1 (AI Setter):**
   - `S1-01_note_parser.json` → System 1 folder

**How to Import:**
1. Go to Workflows
2. Click "Add Workflow" → "Import from File"
3. Select the JSON file
4. Move to correct folder
5. Update credentials in each workflow
6. **Important:** Link "Execute Workflow" nodes to correct workflows

### 6. Link Workflow References

After import, update these nodes:

**In S2-01 Slack Intake:**
- "Trigger Content Processor" → Select S2-02
- "Log Analytics Event" → Select S4-02

**In S1-01 Note Parser:**
- "Call Segmentation Engine" → Create S1-02 or disable

### 7. Activate Workflows

Order of activation:
1. S4-01, S4-02 (utilities)
2. S2-02 (content processor)
3. S2-01 (slack intake) - this enables the webhook
4. S1-01 (note parser) - enables GHL webhook

---

## Slack App Setup

### Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name: `Austin CG Content Bot`
4. Select workspace

### Configure OAuth & Permissions

**Bot Token Scopes needed:**
- `channels:history` - Read messages
- `reactions:read` - See reactions
- `chat:write` - Send messages (for alerts)

### Enable Event Subscriptions

1. Go to "Event Subscriptions" → Enable
2. Request URL: `https://your-n8n-instance.app.n8n.cloud/webhook/slack-reaction`
3. Subscribe to bot events:
   - `reaction_added`
4. Save Changes

### Install App

1. Go to "Install App"
2. Install to Workspace
3. Copy Bot User OAuth Token
4. Add to n8n credentials

### Invite Bot to Channel

In Slack:
```
/invite @Austin CG Content Bot
```

---

## GHL Webhook Setup

### For Note Parser (S1-01)

1. In GHL, go to **Settings → Webhooks**
2. Add new webhook:
   - URL: `https://your-n8n-instance.app.n8n.cloud/webhook/ghl-note-update`
   - Events: `Contact Updated` (or specific note events)
3. Save

### For Response Handler (S1-06) - when built

1. Add webhook for inbound messages
   - URL: `https://your-n8n-instance.app.n8n.cloud/webhook/ghl-reply`
   - Events: `Inbound Message`

---

## Testing Workflows

### Test S4-02 Analytics Logger
```json
// Manual trigger with test data
{
  "event_type": "test_event",
  "event_category": "system4",
  "event_data": { "test": true }
}
```

### Test S2-01 Slack Intake

1. Post a message with a video link in your Slack channel
2. Add a reaction (🏠, 📚, etc.)
3. Check n8n execution
4. Check Supabase `contents` table

### Test S1-01 Note Parser

1. In GHL, update a contact's notes
2. Or manually trigger webhook:
```json
{
  "contact_id": "xxxxx",
  "notes": "Spoke with John. He's interested in buying a multifamily property. Budget around $500k. Looking to close in Q1."
}
```

---

## Troubleshooting

### Webhook not receiving data
- Check URL is correct (no trailing slash issues)
- Verify workflow is active
- Check Slack/GHL webhook logs

### Supabase insert failing
- Verify `apikey` header is correct
- Check RLS policies (or disable for testing)
- Verify table exists

### Claude API errors
- Check API key is valid
- Verify model name is correct
- Check rate limits

### Workflow linking errors
- Ensure target workflow exists and is saved
- Re-select workflow in "Execute Workflow" node

---

## Webhook URLs Summary

After setup, your webhook URLs will be:

| Workflow | Path | Full URL |
|----------|------|----------|
| S2-01 Slack Intake | `/slack-reaction` | `https://xxx.app.n8n.cloud/webhook/slack-reaction` |
| S1-01 Note Parser | `/ghl-note-update` | `https://xxx.app.n8n.cloud/webhook/ghl-note-update` |
| S1-06 Response Handler | `/ghl-reply` | `https://xxx.app.n8n.cloud/webhook/ghl-reply` |

---

## Next Steps After Setup

1. ✅ Import and activate utility workflows
2. ✅ Import and test S2-01 (Slack intake)
3. ✅ Import and test S1-01 (Note parser)
4. 🔲 Build remaining workflows from specs
5. 🔲 Set up Supabase and import prompts
6. 🔲 Configure GHL custom fields
7. 🔲 Train Ashley on tagging

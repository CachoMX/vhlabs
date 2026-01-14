# n8n Credentials Setup Guide

## Overview

You need to configure 4 main credentials in n8n to make all workflows functional.

---

## 1. Supabase Credential

**Name in n8n**: `supabase_austin_cg`
**Type**: HTTP Header Auth

### Steps:
1. In n8n, go to **Credentials** → **New**
2. Search for "HTTP Header Auth"
3. Configure:
   - **Name**: `supabase_austin_cg`
   - **Header Name**: `apikey`
   - **Header Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aWV1eWJkaG5na2trbWF4cHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjU2NjMsImV4cCI6MjA4MTc0MTY2M30.Iz810S-OLictocvT_Hx3rZI7jhIkgPCTcJq9OEBVt5o`
4. Click **Save**

### Also Create Authorization Header:
5. Create another credential:
   - **Name**: `supabase_auth`
   - **Type**: HTTP Header Auth
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aWV1eWJkaG5na2trbWF4cHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjU2NjMsImV4cCI6MjA4MTc0MTY2M30.Iz810S-OLictocvT_Hx3rZI7jhIkgPCTcJq9OEBVt5o`

---

## 2. GoHighLevel (GHL) Credential

**Name in n8n**: `ghl_austin_cg`
**Type**: HTTP Header Auth

### Steps:
1. **Get GHL API Key** (you need to provide this):
   - Log into your GoHighLevel account
   - Go to Settings → API → Create API Key
   - Copy the key

2. In n8n:
   - Go to **Credentials** → **New**
   - Search for "HTTP Header Auth"
   - Configure:
     - **Name**: `ghl_austin_cg`
     - **Header Name**: `Authorization`
     - **Header Value**: `Bearer YOUR_GHL_API_KEY_HERE`
   - Click **Save**

### Also Need:
- GHL Location ID (find in GHL Settings)

---

## 3. Anthropic Claude API Credential

**Name in n8n**: `anthropic_claude`
**Type**: HTTP Header Auth

### Steps:
1. **Get Anthropic API Key**:
   - Go to https://console.anthropic.com/
   - Sign up or log in
   - Go to API Keys → Create Key
   - Copy the key (starts with `sk-ant-`)

2. In n8n:
   - Go to **Credentials** → **New**
   - Search for "HTTP Header Auth"
   - Configure:
     - **Name**: `anthropic_claude`
     - **Header Name**: `x-api-key`
     - **Header Value**: `YOUR_ANTHROPIC_API_KEY_HERE`
   - Click **Save**

---

## 4. Slack Credential

**Name in n8n**: `slack_austin_cg`
**Type**: Slack OAuth2 API

### Steps:
1. **Create Slack App**:
   - Go to https://api.slack.com/apps
   - Click **Create New App** → **From scratch**
   - Name: "Austin CG Content Intake"
   - Select your workspace

2. **Configure Bot Permissions**:
   - Go to **OAuth & Permissions**
   - Add these scopes:
     - `channels:history`
     - `reactions:read`
     - `chat:write`
   - Click **Install to Workspace**
   - Copy the **Bot User OAuth Token** (starts with `xoxb-`)

3. **Enable Event Subscriptions**:
   - Go to **Event Subscriptions** → Enable Events
   - Request URL: `https://YOUR-N8N-INSTANCE.hooks.n8n.cloud/slack-reaction`
   - Subscribe to bot events:
     - `reaction_added`
   - Save Changes

4. In n8n:
   - Go to **Credentials** → **New**
   - Search for "Slack OAuth2 API"
   - Configure:
     - **Name**: `slack_austin_cg`
     - **Access Token**: Your Bot User OAuth Token
   - Click **Save**

---

## 5. n8n Environment Variables

Set these in n8n Settings → Variables:

| Variable Name | Value |
|---------------|-------|
| `SUPABASE_URL` | `https://gxieuybdhngkkkmaxpsj.supabase.co` |
| `SUPABASE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aWV1eWJkaG5na2trbWF4cHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjU2NjMsImV4cCI6MjA4MTc0MTY2M30.Iz810S-OLictocvT_Hx3rZI7jhIkgPCTcJq9OEBVt5o` |
| `GHL_API_KEY` | Your GHL API Key |
| `GHL_LOCATION_ID` | Your GHL Location ID |
| `ANTHROPIC_API_KEY` | Your Anthropic API Key |

### How to Add Variables:
1. Click your profile → **Settings**
2. Go to **Variables** tab
3. Click **Add Variable**
4. Enter name and value
5. Repeat for each variable

---

## Quick Setup Checklist

- [ ] Create Supabase credential (HTTP Header Auth with `apikey`)
- [ ] Create Supabase auth credential (HTTP Header Auth with `Authorization`)
- [ ] Get GHL API Key from GoHighLevel account
- [ ] Create GHL credential (HTTP Header Auth)
- [ ] Get Anthropic API Key from console.anthropic.com
- [ ] Create Anthropic credential (HTTP Header Auth with `x-api-key`)
- [ ] Create Slack App and get Bot Token
- [ ] Create Slack credential (Slack OAuth2)
- [ ] Configure Event Subscriptions in Slack
- [ ] Add all environment variables in n8n Settings

---

## Testing Credentials

### Test Supabase Connection:
1. Open workflow **S4-02 Analytics Logger**
2. Click **Execute Workflow**
3. Should create a test record in `analytics_events` table

### Test Anthropic:
1. Open workflow **S1-01 Note Parser**
2. Use manual test data
3. Should get AI response

### Test Slack:
1. Open workflow **S2-01 Slack Intake**
2. React to a message in your Slack channel
3. Should create content record in Supabase

---

## What Credentials You Need to Obtain

### Required (Must Have):
1. ✅ **Supabase** - Already have (from dashboard setup)
2. ❓ **Anthropic API Key** - Need to get from console.anthropic.com
3. ❓ **GoHighLevel API Key** - Need to get from your GHL account

### Optional (For Full Functionality):
4. ❓ **Slack Bot Token** - If using Slack content intake
5. ❓ **Instagram API** - For Instagram posting (S3-04)

---

## Cost Estimates

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Supabase | ✅ Free (current usage) | $25/mo Pro |
| n8n Cloud | ✅ Free tier available | $20/mo Starter |
| Anthropic Claude | $5 free credits | Pay-as-you-go (~$3-15/mo) |
| GoHighLevel | N/A | Existing subscription |
| Slack | ✅ Free | N/A |

---

## Next Steps After Credentials Setup

1. **Activate the utility workflows first**:
   - S4-01: Error Logger
   - S4-02: Analytics Logger
   - S4-03: GHL Contact Sync

2. **Test a simple workflow**:
   - S4-02 Analytics Logger (manual execution)
   - Check dashboard Analytics page for the event

3. **Build out System 2 (Content Pipeline)**:
   - S2-01: Slack Intake
   - S2-02: Content Processor

4. **Enable System 3 (Distribution)**:
   - S3-01: Distribution Router
   - S3-02: Email Generator

---

## Troubleshooting

### Supabase Connection Errors:
- Verify URL is exactly: `https://gxieuybdhngkkkmaxpsj.supabase.co`
- Check API key is the anon key (not service role key)
- Ensure RLS policies allow inserts from anon key

### Anthropic API Errors:
- Verify header name is `x-api-key` (not `Authorization`)
- Check you have credits in your Anthropic account
- Ensure using correct model: `claude-sonnet-4-20250514`

### GHL Errors:
- Check API key has correct permissions
- Verify Location ID is correct
- Test with Postman first

---

## Support

If you encounter issues:
1. Check n8n execution logs
2. Verify credential configuration
3. Test API endpoints directly with curl/Postman
4. Check Supabase logs for RLS policy issues

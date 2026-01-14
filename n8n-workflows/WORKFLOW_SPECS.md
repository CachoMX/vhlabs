# n8n Workflows - Austin CG Investor Platform

## Overview

This document contains specifications for all n8n workflows across the 4 systems.

**Environment**: cloud.n8n.io
**Total Workflows**: 15 core workflows + 3 utility workflows

---

## Environment Setup

### Required Credentials

Create these credentials in n8n before importing workflows:

| Credential Name | Type | Required Keys |
|-----------------|------|---------------|
| `supabase_austin_cg` | HTTP Header Auth | `apikey: <SUPABASE_KEY>` |
| `ghl_austin_cg` | HTTP Header Auth | `Authorization: Bearer <GHL_API_KEY>` |
| `slack_austin_cg` | Slack OAuth2 | Bot token with reactions:read, channels:history |
| `anthropic_claude` | HTTP Header Auth | `x-api-key: <ANTHROPIC_KEY>` |
| `openai_backup` | OpenAI API | API Key (backup if Claude fails) |

### Environment Variables

Set these in n8n Settings → Variables:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
GHL_API_KEY=xxxxxxxx
GHL_LOCATION_ID=xxxxxxxx
SLACK_CHANNEL_ID=C0XXXXXX
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Folder Structure in n8n

Create these folders to organize workflows:

```
📁 Austin CG
├── 📁 System 1 - AI Setter
├── 📁 System 2 - Content Pipeline
├── 📁 System 3 - Distribution
├── 📁 System 4 - Orchestration
└── 📁 Utilities
```

---

## Workflow Index

### System 1: AI Setter & Investor Intelligence
| ID | Workflow Name | Trigger | Purpose |
|----|---------------|---------|---------|
| S1-01 | Note Parser | Webhook (GHL) | Parse call notes, extract intent |
| S1-02 | Segmentation Engine | Called by S1-01 | Apply rules, update segment |
| S1-03 | Touchpoint Scheduler | Cron (daily 8am) | Queue daily check-ins |
| S1-04 | Setter Message Generator | Called by S1-03 | Generate personalized messages |
| S1-05 | Setter Message Sender | Queue trigger | Send via GHL |
| S1-06 | Response Handler | Webhook (GHL) | Process replies, classify, route |

### System 2: Content Intelligence & Processing
| ID | Workflow Name | Trigger | Purpose |
|----|---------------|---------|---------|
| S2-01 | Slack Intake | Webhook (Slack) | Receive tagged content |
| S2-02 | Content Processor | Called by S2-01 | AI extraction pipeline |
| S2-03 | Transcript Processor | Called by S2-02 | Clean and structure transcripts |

### System 3: Multi-Channel Distribution
| ID | Workflow Name | Trigger | Purpose |
|----|---------------|---------|---------|
| S3-01 | Distribution Router | Manual/Webhook | Route content to channels |
| S3-02 | Email Generator | Called by S3-01 | Generate email teasers |
| S3-03 | Email Sender | Queue trigger | Send via GHL |
| S3-04 | Instagram Poster | Called by S3-01 | Post to Instagram |

### System 4: Orchestration & Utilities
| ID | Workflow Name | Trigger | Purpose |
|----|---------------|---------|---------|
| S4-01 | Error Logger | Called by all | Log errors to Supabase |
| S4-02 | Analytics Logger | Called by all | Log events to Supabase |
| S4-03 | GHL Contact Sync | Cron (hourly) | Sync contacts to Supabase |

---

## Detailed Workflow Specifications

---

## S1-01: Note Parser

**Purpose**: When call notes are updated in GHL, parse them with AI to extract intent signals, objections, timeline, and recommend segmentation.

**Trigger**: Webhook from GHL (contact.note.added or contact.updated)

### Flow Diagram
```
[GHL Webhook] 
    → [Validate Payload]
    → [Get Contact from GHL]
    → [Get note_parser Prompt from Supabase]
    → [Call Claude API]
    → [Parse JSON Response]
    → [Update Supabase contacts_sync]
    → [Call S1-02 Segmentation Engine]
    → [Log Analytics Event]
```

### Nodes

#### 1. Webhook Trigger
- **Type**: Webhook
- **Method**: POST
- **Path**: `/ghl-note-update`
- **Authentication**: Header Auth (optional, or validate in next node)

#### 2. Validate Payload
- **Type**: IF
- **Condition**: `{{ $json.contact_id }}` exists AND `{{ $json.notes }}` exists

#### 3. Get Contact from GHL
- **Type**: HTTP Request
- **Method**: GET
- **URL**: `https://rest.gohighlevel.com/v1/contacts/{{ $json.contact_id }}`
- **Headers**: 
  - `Authorization: Bearer {{ $vars.GHL_API_KEY }}`
- **Output**: Full contact object

#### 4. Get Prompt from Supabase
- **Type**: HTTP Request
- **Method**: GET
- **URL**: `{{ $vars.SUPABASE_URL }}/rest/v1/prompts?prompt_id=eq.note_parser&is_active=eq.true&limit=1`
- **Headers**:
  - `apikey: {{ $vars.SUPABASE_KEY }}`
  - `Authorization: Bearer {{ $vars.SUPABASE_KEY }}`

#### 5. Call Claude API
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `https://api.anthropic.com/v1/messages`
- **Headers**:
  - `x-api-key: {{ $vars.ANTHROPIC_API_KEY }}`
  - `anthropic-version: 2023-06-01`
  - `content-type: application/json`
- **Body**:
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "{{ $node['Get Prompt'].json.content }}\n\nCall Notes:\n{{ $node['Get Contact'].json.notes }}"
    }
  ]
}
```

#### 6. Parse JSON Response
- **Type**: Code
- **Language**: JavaScript
```javascript
const response = $input.first().json;
const text = response.content[0].text;

// Extract JSON from response (handle markdown code blocks)
let jsonStr = text;
if (text.includes('```json')) {
  jsonStr = text.split('```json')[1].split('```')[0];
} else if (text.includes('```')) {
  jsonStr = text.split('```')[1].split('```')[0];
}

const parsed = JSON.parse(jsonStr.trim());

return {
  json: {
    ...parsed,
    contact_id: $('Webhook Trigger').json.contact_id,
    raw_response: text
  }
};
```

#### 7. Update Supabase contacts_sync
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `{{ $vars.SUPABASE_URL }}/rest/v1/contacts_sync`
- **Headers**:
  - `apikey: {{ $vars.SUPABASE_KEY }}`
  - `Authorization: Bearer {{ $vars.SUPABASE_KEY }}`
  - `Prefer: resolution=merge-duplicates`
- **Body**:
```json
{
  "ghl_id": "{{ $json.contact_id }}",
  "parsed_notes": {{ JSON.stringify($json) }},
  "investor_status": "{{ $json.recommended_status }}",
  "last_synced_at": "{{ new Date().toISOString() }}"
}
```

#### 8. Call Segmentation Engine (Execute Workflow)
- **Type**: Execute Workflow
- **Workflow**: S1-02 Segmentation Engine
- **Input**: Pass parsed data

#### 9. Log Analytics Event
- **Type**: Execute Workflow
- **Workflow**: S4-02 Analytics Logger
- **Input**:
```json
{
  "event_type": "note_parsed",
  "event_category": "system1",
  "contact_id": "{{ $json.contact_id }}",
  "event_data": {
    "recommended_status": "{{ $json.recommended_status }}",
    "intent_signals": {{ JSON.stringify($json.intent_signals) }}
  }
}
```

---

## S1-02: Segmentation Engine

**Purpose**: Apply segmentation rules based on parsed note data and contact history. Update GHL tags and custom fields.

**Trigger**: Called by S1-01 (Execute Workflow)

### Flow Diagram
```
[Start]
    → [Get Current Contact Data]
    → [Apply Segmentation Rules (Code)]
    → [IF Status Changed]
        → [Update GHL Tags]
        → [Update GHL Custom Fields]
    → [Update Supabase]
    → [Return Result]
```

### Nodes

#### 1. Apply Segmentation Rules
- **Type**: Code
- **Language**: JavaScript
```javascript
const input = $input.first().json;
const {
  intent_signals = [],
  objections = [],
  timeline,
  sentiment,
  recommended_status,
  follow_up_priority
} = input;

let newStatus = recommended_status;
let newSegment = input.current_segment || 'general_leads';

// Rule: Multiple buying signals + short timeline = hot_lead
if (intent_signals.includes('buying') && 
    (timeline === 'immediate' || timeline === 'short')) {
  newStatus = 'hot_lead';
}

// Rule: JV language = jv_potential
if (intent_signals.includes('partnering')) {
  newStatus = 'jv_potential';
  newSegment = 'jv_partners';
}

// Rule: Has objections = objection_holder (unless hot)
if (objections.length > 0 && newStatus !== 'hot_lead') {
  newStatus = 'objection_holder';
}

// Rule: Negative sentiment + no clear intent = tire_kicker
if (sentiment === 'negative' && intent_signals.includes('none')) {
  newStatus = 'tire_kicker';
}

// Determine if status actually changed
const statusChanged = newStatus !== input.current_status;

return {
  json: {
    contact_id: input.contact_id,
    new_status: newStatus,
    new_segment: newSegment,
    status_changed: statusChanged,
    previous_status: input.current_status,
    follow_up_priority: follow_up_priority || 'medium'
  }
};
```

#### 2. IF Status Changed
- **Type**: IF
- **Condition**: `{{ $json.status_changed }}` equals `true`

#### 3. Update GHL Tags (True branch)
- **Type**: HTTP Request
- **Method**: PUT
- **URL**: `https://rest.gohighlevel.com/v1/contacts/{{ $json.contact_id }}`
- **Body**:
```json
{
  "tags": ["{{ $json.new_status }}", "{{ $json.new_segment }}"]
}
```

#### 4. Update GHL Custom Fields
- **Type**: HTTP Request
- **Method**: PUT
- **URL**: `https://rest.gohighlevel.com/v1/contacts/{{ $json.contact_id }}`
- **Body**:
```json
{
  "customField": {
    "investor_status": "{{ $json.new_status }}",
    "segment": "{{ $json.new_segment }}"
  }
}
```

---

## S1-03: Touchpoint Scheduler

**Purpose**: Daily job to identify contacts due for touchpoints based on segment frequency rules.

**Trigger**: Cron - Daily at 8:00 AM

### Flow Diagram
```
[Cron Trigger 8am]
    → [Get Frequency Rules from Supabase]
    → [Get Contacts Due for Touchpoint]
    → [Loop: For Each Contact]
        → [Create Touchpoint Queue Entry]
    → [Trigger S1-04 for Processing]
    → [Log Analytics]
```

### Nodes

#### 1. Cron Trigger
- **Type**: Schedule Trigger
- **Rule**: `0 8 * * *` (8am daily)

#### 2. Get Frequency Rules
- **Type**: HTTP Request
- **Method**: GET
- **URL**: `{{ $vars.SUPABASE_URL }}/rest/v1/investor_statuses?select=slug,touchpoint_frequency_days&touchpoint_frequency_days=not.is.null`

#### 3. Get Contacts Due for Touchpoint
- **Type**: Code
```javascript
// Build query to find contacts where:
// last_touchpoint_at + frequency_days <= today
// OR last_touchpoint_at is null

const rules = $input.first().json;
const today = new Date().toISOString();

// This will be a complex query - simplified here
return {
  json: {
    query_date: today,
    rules: rules
  }
};
```

#### 4. Query Supabase for Due Contacts
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `{{ $vars.SUPABASE_URL }}/rest/v1/rpc/get_contacts_due_for_touchpoint`
- **Body**: `{ "check_date": "{{ $json.query_date }}" }`

*Note: Create this as a Supabase function for complex date logic*

#### 5. Loop Each Contact
- **Type**: Split In Batches
- **Batch Size**: 10

#### 6. Create Queue Entry
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `{{ $vars.SUPABASE_URL }}/rest/v1/touchpoint_queue`
- **Body**:
```json
{
  "ghl_contact_id": "{{ $json.ghl_id }}",
  "scheduled_for": "{{ new Date().toISOString() }}",
  "channel": "{{ $json.preferred_channel || 'email' }}",
  "status": "pending"
}
```

---

## S1-04: Setter Message Generator

**Purpose**: Generate personalized check-in messages using AI.

**Trigger**: Called by S1-03 or manually

### Flow Diagram
```
[Start]
    → [Get Pending Queue Items]
    → [Loop: For Each Item]
        → [Get Contact Details]
        → [Select Prompt Based on Status]
        → [Get Prompt from Supabase]
        → [Call Claude API]
        → [Update Queue with Generated Message]
    → [Trigger S1-05 Sender]
```

### Key Node: Select Prompt
- **Type**: Switch
- **Routing**:
  - `hot_lead` → `setter_hot_lead`
  - `dormant` → `setter_dormant_reengagement`
  - `objection_holder` → `setter_objection_response`
  - Default → `setter_update_base`

### Key Node: Claude API Call
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 256,
  "messages": [
    {
      "role": "user", 
      "content": "{{ $node['Get Prompt'].json.content }}\n\nContact name: {{ $json.first_name }}\nSegment: {{ $json.segment }}\nStatus: {{ $json.investor_status }}\nLast notes: {{ $json.latest_notes }}\nChannel: {{ $json.channel }}"
    }
  ]
}
```

---

## S2-01: Slack Intake

**Purpose**: Receive Slack reaction events, create content records in Supabase.

**Trigger**: Webhook from Slack (Event Subscriptions)

### Flow Diagram
```
[Slack Webhook]
    → [Verify Slack Signature]
    → [Filter: reaction_added only]
    → [Get Original Message]
    → [Map Reaction to Segment]
    → [Create Content Record in Supabase]
    → [Trigger S2-02 Content Processor]
    → [Log Analytics]
```

### Nodes

#### 1. Webhook Trigger
- **Type**: Webhook
- **Method**: POST
- **Path**: `/slack-reaction`

#### 2. Verify Slack Signature
- **Type**: Code
```javascript
// In production, verify x-slack-signature header
// For now, check event type
const body = $input.first().json;

if (body.type === 'url_verification') {
  // Slack verification challenge
  return { json: { challenge: body.challenge } };
}

if (body.event?.type !== 'reaction_added') {
  return { json: { skip: true } };
}

return { json: body.event };
```

#### 3. Get Original Message
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `https://slack.com/api/conversations.history`
- **Headers**: `Authorization: Bearer {{ $credentials.slack_austin_cg.accessToken }}`
- **Body**:
```json
{
  "channel": "{{ $json.item.channel }}",
  "latest": "{{ $json.item.ts }}",
  "inclusive": true,
  "limit": 1
}
```

#### 4. Map Reaction to Segment
- **Type**: Code
```javascript
const reaction = $input.first().json.reaction;

const reactionMap = {
  'house': 're_investors',
  'house_with_garden': 'house_buyers',
  'dog': 'bird_doggers',
  'handshake': 'jv_partners',
  'books': 'coaching_students',
  'moneybag': 'wholesalers',
  'bank': 'lenders',
  'memo': 'sellers',
  'question': 'general_leads',
  'fire': '_priority_high',
  'star': '_featured'
};

const segment = reactionMap[reaction] || 'general_leads';
const isPriority = reaction === 'fire';
const isFeatured = reaction === 'star';

return {
  json: {
    segment: segment.startsWith('_') ? null : segment,
    is_priority: isPriority,
    is_featured: isFeatured,
    reaction: reaction
  }
};
```

#### 5. Create Content Record
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `{{ $vars.SUPABASE_URL }}/rest/v1/contents`
- **Headers**:
  - `apikey: {{ $vars.SUPABASE_KEY }}`
  - `Prefer: return=representation`
- **Body**:
```json
{
  "source_url": "{{ $node['Get Message'].json.messages[0].text }}",
  "source_type": "call",
  "slack_channel_id": "{{ $json.item.channel }}",
  "slack_message_ts": "{{ $json.item.ts }}",
  "slack_reactions": [{ "reaction": "{{ $json.reaction }}", "user": "{{ $json.user }}" }],
  "audiences": ["{{ $json.segment }}"],
  "is_featured": {{ $json.is_featured }},
  "priority": "{{ $json.is_priority ? 'high' : 'medium' }}",
  "status": "pending"
}
```

#### 6. Trigger Content Processor
- **Type**: Execute Workflow
- **Workflow**: S2-02 Content Processor
- **Input**: Pass content record

---

## S2-02: Content Processor

**Purpose**: AI extraction of hooks, clips, and metadata from content.

**Trigger**: Called by S2-01 or manual

### Flow Diagram
```
[Start]
    → [Update Status to 'processing']
    → [Check if Transcript Exists]
        → [IF No] → [Call Transcription API]
    → [Call S2-03 Transcript Processor]
    → [Get content_agent Prompt]
    → [Call Claude API (extraction)]
    → [Parse Response]
    → [Insert Hooks to hooks table]
    → [Update Content Record (status: ready)]
    → [Calculate Score]
    → [Log Analytics]
```

### Key Node: Claude Extraction
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": "{{ $node['Get Prompt'].json.content }}\n\nTranscript:\n{{ $node['Get Transcript'].json.transcript }}"
    }
  ]
}
```

### Key Node: Insert Hooks
- **Type**: Split In Batches
- Then HTTP Request POST to `/rest/v1/hooks` for each hook

---

## S3-01: Distribution Router

**Purpose**: Route content to appropriate channels based on audience mapping.

**Trigger**: Manual or webhook when content status = 'ready'

### Flow Diagram
```
[Start]
    → [Get Content Record]
    → [Get Routing Rules from segments table]
    → [For Each Audience]
        → [Get Contacts in Segment]
        → [Determine Channels]
        → [Create Distribution Records]
        → [Route to Channel Workflows]
            → [Email] → S3-02
            → [SMS] → Direct to GHL
            → [Instagram] → S3-04
    → [Update Content status to 'distributed']
```

### Key Node: Get Routing Rules
- **Type**: HTTP Request
- **URL**: `{{ $vars.SUPABASE_URL }}/rest/v1/segments?slug=in.({{ $json.audiences.join(',') }})`

---

## S4-01: Error Logger

**Purpose**: Centralized error logging to Supabase.

**Trigger**: Called by other workflows on error

### Input Expected
```json
{
  "workflow_name": "S1-01 Note Parser",
  "node_name": "Claude API",
  "error_message": "Rate limit exceeded",
  "error_data": { ... },
  "severity": "high"
}
```

### Flow
```
[Start]
    → [Insert to analytics_events]
    → [IF severity = critical]
        → [Send Slack Alert]
    → [Return]
```

---

## S4-02: Analytics Logger

**Purpose**: Log events for tracking and dashboard.

**Trigger**: Called by other workflows

### Input Expected
```json
{
  "event_type": "content_processed",
  "event_category": "system2",
  "content_id": "uuid",
  "contact_id": "ghl_id",
  "event_data": { ... }
}
```

### Flow
```
[Start]
    → [Insert to analytics_events table]
    → [Return]
```

---

## S4-03: GHL Contact Sync

**Purpose**: Sync GHL contacts to Supabase for analytics and cross-referencing.

**Trigger**: Cron - Hourly

### Flow
```
[Cron Trigger]
    → [Get Last Sync Timestamp]
    → [Fetch Updated Contacts from GHL]
    → [Loop: Upsert to Supabase]
    → [Update Sync Timestamp]
    → [Log Analytics]
```

---

## Supabase Function: get_contacts_due_for_touchpoint

Add this function to Supabase for the Touchpoint Scheduler:

```sql
CREATE OR REPLACE FUNCTION get_contacts_due_for_touchpoint(check_date TIMESTAMPTZ)
RETURNS TABLE (
  id UUID,
  ghl_id TEXT,
  first_name TEXT,
  email TEXT,
  phone TEXT,
  segment TEXT,
  investor_status TEXT,
  latest_notes TEXT,
  preferred_channel TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.ghl_id,
    cs.first_name,
    cs.email,
    cs.phone,
    cs.segment,
    cs.investor_status,
    cs.latest_notes,
    COALESCE(s.channel_primary, 'email') as preferred_channel
  FROM contacts_sync cs
  JOIN investor_statuses ist ON cs.investor_status = ist.slug
  LEFT JOIN segments s ON cs.segment = s.slug
  WHERE 
    ist.touchpoint_frequency_days IS NOT NULL
    AND cs.investor_status != 'cold'
    AND (
      cs.last_touchpoint_at IS NULL
      OR cs.last_touchpoint_at + (ist.touchpoint_frequency_days || ' days')::INTERVAL <= check_date
    );
END;
$$ LANGUAGE plpgsql;
```

---

## Webhook URLs Summary

After creating workflows, these webhook URLs will be generated:

| Workflow | Webhook Path | Full URL (example) |
|----------|--------------|-------------------|
| S1-01 Note Parser | `/ghl-note-update` | `https://xxxx.hooks.n8n.cloud/ghl-note-update` |
| S1-06 Response Handler | `/ghl-reply` | `https://xxxx.hooks.n8n.cloud/ghl-reply` |
| S2-01 Slack Intake | `/slack-reaction` | `https://xxxx.hooks.n8n.cloud/slack-reaction` |

Configure these in:
- GHL → Settings → Webhooks
- Slack → App → Event Subscriptions

---

## Testing Checklist

### S1-01 Note Parser
- [ ] Receives GHL webhook
- [ ] Fetches correct prompt
- [ ] Claude returns valid JSON
- [ ] Supabase record created
- [ ] Segmentation triggered

### S2-01 Slack Intake
- [ ] Responds to Slack challenge
- [ ] Maps reactions correctly
- [ ] Creates content record
- [ ] Triggers processor

### S3-01 Distribution Router
- [ ] Routes to correct channels
- [ ] Creates distribution records
- [ ] Updates content status

---

## Next Steps

1. **Create credentials in n8n**
2. **Create folder structure**
3. **Build S4-01 and S4-02 first** (utilities used by all)
4. **Build S2-01 Slack Intake** (good for testing)
5. **Build remaining workflows in order**
6. **Configure webhooks in GHL and Slack**
7. **Test end-to-end**

# Agent Communication API Testing Guide

## Overview
This guide covers testing all 4 agent communication endpoints:
1. `POST /agent-generate-token` - Generate agent authentication token
2. `GET /agent-read-note` - Read note content
3. `POST /agent-update-note` - Update/append to note
4. `POST /agent-revoke-token` - Revoke agent token

---

## Prerequisites

### 1. Get User JWT Token
You need a valid user JWT from your Supabase authentication. Get this from:
- Your Noted app (inspect browser storage → supabase.auth.token)
- Or create a test user and authenticate via Supabase Auth

```bash
export USER_JWT="your-jwt-token-here"
```

### 2. Get Note ID
Create a test note in your app or query the database:
```sql
SELECT id, title FROM notes LIMIT 1;
```

```bash
export NOTE_ID="your-note-id-here"
```

### 3. Set Supabase URL
```bash
export SUPABASE_URL="https://ikovzegiuzjkubymwvjz.supabase.co"
```

---

## Test 1: Generate Agent Token

**Purpose**: Create a new agent authentication token for API access

```bash
curl -X POST "$SUPABASE_URL/functions/v1/agent-generate-token" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Token - Manual Testing"}'
```

**Expected Response** (200 OK):
```json
{
  "token": "agent_abc123def456...(full 64 chars)",
  "token_id": "uuid",
  "token_prefix": "agent_abc123def4",
  "expires_at": "2025-12-31T23:59:59Z",
  "warning": "Save this token securely. It will not be shown again."
}
```

**Save the token**:
```bash
export AGENT_TOKEN="agent_abc123def456...(paste full token here)"
```

---

## Test 2: Read Note

**Purpose**: Verify agent can read note content with token

```bash
curl "$SUPABASE_URL/functions/v1/agent-read-note?note_id=$NOTE_ID" \
  -H "Authorization: Bearer $AGENT_TOKEN"
```

**Expected Response** (200 OK):
```json
{
  "note_id": "uuid",
  "title": "My Note Title",
  "content": "Note content here...",
  "created_at": "2025-10-10T10:00:00Z",
  "updated_at": "2025-10-10T14:30:00Z"
}
```

---

## Test 3: Update Note (Replace Mode)

**Purpose**: Replace note content entirely

```bash
curl -X POST "$SUPABASE_URL/functions/v1/agent-update-note" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note_id": "'"$NOTE_ID"'",
    "content": "# Agent Test\n\nThis content was written by the agent at '"$(date)"'.\n\n## Test Details\n- Mode: Replace\n- Status: Success",
    "append": false
  }'
```

**Expected Response** (200 OK):
```json
{
  "note_id": "uuid",
  "updated_at": "2025-10-10T14:32:15Z",
  "content_hash": "sha256:...",
  "message": "Note updated successfully"
}
```

---

## Test 4: Update Note (Append Mode with Optimistic Locking)

**Purpose**: Append content to note with version check to prevent conflicts

**Step 1**: Get current version
```bash
CURRENT_VERSION=$(curl -s "$SUPABASE_URL/functions/v1/agent-read-note?note_id=$NOTE_ID" \
  -H "Authorization: Bearer $AGENT_TOKEN" | jq -r '.updated_at')

echo "Current version: $CURRENT_VERSION"
```

**Step 2**: Append content
```bash
curl -X POST "$SUPABASE_URL/functions/v1/agent-update-note" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note_id": "'"$NOTE_ID"'",
    "content": "\n\n---\n\n## Appended by Agent\n\nTimestamp: '"$(date)"'\nTest: Append mode with optimistic locking",
    "append": true,
    "expected_version": "'"$CURRENT_VERSION"'"
  }'
```

**Expected Response** (200 OK):
```json
{
  "note_id": "uuid",
  "updated_at": "2025-10-10T14:35:00Z",
  "content_hash": "sha256:...",
  "message": "Note updated successfully"
}
```

**Expected Response (Version Conflict)** (409 Conflict):
```json
{
  "error": "Note was modified by another process. Retry with latest version.",
  "code": "VERSION_CONFLICT",
  "current_version": "2025-10-10T14:35:00Z"
}
```

---

## Test 5: Security - Invalid Token

**Purpose**: Verify API rejects invalid tokens

```bash
curl "$SUPABASE_URL/functions/v1/agent-read-note?note_id=$NOTE_ID" \
  -H "Authorization: Bearer agent_fakefakefake_thisisnotarealtokenitshouldfail"
```

**Expected Response** (401 Unauthorized):
```json
{
  "error": "Invalid or revoked token",
  "code": "INVALID_TOKEN"
}
```

---

## Test 6: Content Validation - Size Limit

**Purpose**: Verify API rejects content >10,240 bytes

```bash
curl -X POST "$SUPABASE_URL/functions/v1/agent-update-note" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note_id": "'"$NOTE_ID"'",
    "content": "'"$(printf 'A%.0s' {1..11000})"'",
    "append": false
  }'
```

**Expected Response** (413 Payload Too Large):
```json
{
  "error": "Content exceeds 10,240 bytes (10 KiB) limit",
  "code": "CONTENT_TOO_LARGE",
  "max_size_bytes": 10240
}
```

---

## Test 7: XSS Prevention

**Purpose**: Verify API blocks dangerous content patterns

```bash
curl -X POST "$SUPABASE_URL/functions/v1/agent-update-note" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note_id": "'"$NOTE_ID"'",
    "content": "Safe content <script>alert(\"XSS\")</script> more content",
    "append": false
  }'
```

**Expected Response** (413 with dangerous content error):
```json
{
  "error": "Content contains potentially dangerous patterns (XSS prevention)",
  "code": "CONTENT_TOO_LARGE"
}
```

---

## Test 8: Revoke Token

**Purpose**: Revoke agent token to prevent further use

**Get Token ID** (from generate response or database):
```bash
export TOKEN_ID="token-uuid-here"
```

**Revoke**:
```bash
curl -X POST "$SUPABASE_URL/functions/v1/agent-revoke-token" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"token_id": "'"$TOKEN_ID"'"}'
```

**Expected Response** (200 OK):
```json
{
  "message": "Token revoked successfully",
  "token_id": "uuid",
  "revoked_at": "2025-10-10T14:40:00Z"
}
```

---

## Test 9: Revoked Token Rejection

**Purpose**: Verify revoked tokens cannot access API

```bash
curl "$SUPABASE_URL/functions/v1/agent-read-note?note_id=$NOTE_ID" \
  -H "Authorization: Bearer $AGENT_TOKEN"
```

**Expected Response** (401 Unauthorized):
```json
{
  "error": "Invalid or revoked token",
  "code": "INVALID_TOKEN"
}
```

---

## Automated Test Suite

For comprehensive testing, use the Deno test script:

```bash
# Install Deno if needed
# See: https://deno.land/

# Set environment variables
export USER_JWT="your-jwt"
export NOTE_ID="your-note-id"

# Run tests
deno run --allow-net --allow-env test-agent-endpoints.ts
```

---

## Expected Test Results

| Test | Endpoint | Expected Status | Validation |
|------|----------|-----------------|------------|
| 1. Generate Token | `POST /agent-generate-token` | 200 OK | Returns 64-char token |
| 2. Read Note | `GET /agent-read-note` | 200 OK | Returns note content |
| 3. Update (Replace) | `POST /agent-update-note` | 200 OK | Note content replaced |
| 4. Update (Append) | `POST /agent-update-note` | 200 OK | Content appended |
| 5. Invalid Token | `GET /agent-read-note` | 401 Unauthorized | Security enforced |
| 6. Content Too Large | `POST /agent-update-note` | 413 Payload Too Large | Size limit enforced |
| 7. XSS Content | `POST /agent-update-note` | 413 | XSS prevention active |
| 8. Revoke Token | `POST /agent-revoke-token` | 200 OK | Token revoked |
| 9. Use Revoked Token | `GET /agent-read-note` | 401 Unauthorized | Revocation enforced |

---

## Troubleshooting

### Error: "Unauthorized" (401)
- Check USER_JWT is valid and not expired
- Ensure token was copied completely

### Error: "Note not found" (404)
- Verify NOTE_ID exists in database
- Check note belongs to authenticated user

### Error: "Token not found" (404 on revoke)
- Ensure TOKEN_ID is correct
- Verify user owns the token

### Error: "CORS" or "Network"
- Check SUPABASE_URL is correct
- Verify Edge Functions are deployed

---

## Security Checklist

- [x] Tokens are bcrypt hashed (10 rounds)
- [x] Invalid tokens rejected with 401
- [x] Revoked tokens cannot access API
- [x] Content >10 KiB rejected
- [x] XSS patterns blocked
- [x] Optimistic locking prevents conflicts
- [x] Rate limiting enforced (100 req/hour)
- [x] Ownership validation (users can only access their notes)
- [x] Audit logging (all writes logged with SHA-256 hash)
- [x] Auto-revocation after 10 failed attempts

---

## Next Steps

After all tests pass:
1. **Phase 3**: Implement Token Management UI (`app/settings/agent-tokens.tsx`)
2. **Phase 4**: Write unit and integration tests
3. **Phase 5**: Create documentation and usage guides

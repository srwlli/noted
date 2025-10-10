# Agent Communication API Documentation

**Version**: 1.0.0
**Base URL**: `https://ikovzegiuzjkubymwvjz.supabase.co/functions/v1`
**Authentication**: Bearer token (user JWT for token management, agent token for note operations)

---

## Overview

The Agent Communication API enables AI agents (like Claude Code) to securely read and write notes on behalf of users. All operations require authentication via secure tokens and are subject to rate limiting.

### Key Features

- **Secure Token Authentication**: Bcrypt-hashed 64-character tokens
- **Rate Limiting**: 100 requests per hour per token
- **Automatic Expiry**: Tokens expire after 90 days
- **Auto-Revocation**: Tokens auto-revoke after 10 failed authentication attempts
- **Audit Logging**: All write operations are logged with SHA-256 hashes
- **XSS Prevention**: Content validation on all write operations
- **Ownership Verification**: Users can only access their own notes

---

## Authentication

### Token Types

1. **User JWT** (for token management endpoints)
   - Obtained via Supabase authentication
   - Used for: `agent-generate-token`, `agent-revoke-token`

2. **Agent Token** (for note operations)
   - 64-character format: `agent_[12_random_chars]_[52_random_chars]`
   - Used for: `agent-read-note`, `agent-update-note`
   - Example: `agent_abc123def456_longrandomstringherewithmorerandomcharacters1234567890`

### Authorization Header

```http
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Generate Token

**Endpoint**: `POST /agent-generate-token`
**Authentication**: User JWT (required)
**Description**: Generates a new agent authentication token for the authenticated user.

#### Request

```http
POST /agent-generate-token
Authorization: Bearer <user_jwt>
Content-Type: application/json

{
  "name": "Claude Code - Desktop" // optional
}
```

#### Response (200 OK)

```json
{
  "token": "agent_abc123def456_longrandomstringherewithmorerandomcharacters1234567890",
  "token_id": "550e8400-e29b-41d4-a716-446655440000",
  "token_prefix": "agent_abc123def4",
  "expires_at": "2025-01-08T12:00:00.000Z",
  "warning": "Save this token securely. It will not be shown again."
}
```

#### Response Headers

```
Cache-Control: no-store
X-Content-Type-Options: nosniff
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | Missing or invalid user JWT |
| 500 | `DATABASE_ERROR` | Failed to create token in database |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

#### Notes

- The plaintext token is **only shown once** in this response
- Store the token securely (e.g., in `.env` file)
- Token is bcrypt-hashed in database with 10 salt rounds
- Token expires exactly 90 days from creation

---

### 2. Read Note

**Endpoint**: `GET /agent-read-note`
**Authentication**: Agent token (required)
**Description**: Retrieves note content for the specified note ID.

#### Request

```http
GET /agent-read-note?note_id=550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer agent_abc123def456_longrandomstringhere...
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `note_id` | UUID | Yes | The ID of the note to read |

#### Response (200 OK)

```json
{
  "note_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "My Note Title",
  "content": "Note content in markdown format...",
  "created_at": "2025-10-01T12:00:00.000Z",
  "updated_at": "2025-10-10T12:00:00.000Z"
}
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `MISSING_NOTE_ID` | The `note_id` parameter is missing |
| 401 | `MISSING_AUTH_HEADER` | Authorization header is missing |
| 401 | `INVALID_AUTH_FORMAT` | Authorization header format is incorrect |
| 401 | `INVALID_TOKEN_FORMAT` | Token doesn't match `agent_*` format |
| 401 | `INVALID_TOKEN` | Token not found or revoked |
| 401 | `TOKEN_EXPIRED` | Token has expired (>90 days old) |
| 401 | `TOKEN_AUTO_REVOKED` | Token was auto-revoked due to 10+ failed attempts |
| 403 | `UNAUTHORIZED_NOTE` | Token's user doesn't own this note |
| 404 | `NOTE_NOT_FOUND` | Note with this ID doesn't exist |
| 429 | `RATE_LIMIT_EXCEEDED` | 100 requests/hour limit exceeded |
| 500 | `DATABASE_ERROR` | Database query failed |
| 500 | `VALIDATION_ERROR` | Token validation error |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

#### Rate Limiting Response (429)

```json
{
  "error": "Rate limit exceeded (100 requests/hour)",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 1800
}
```

Response headers include:
```
Retry-After: 1800
```

---

### 3. Update Note

**Endpoint**: `POST /agent-update-note`
**Authentication**: Agent token (required)
**Description**: Updates note content with replace or append mode.

#### Request

```http
POST /agent-update-note
Authorization: Bearer agent_abc123def456_longrandomstringhere...
Content-Type: application/json

{
  "note_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "New content or content to append",
  "append": false, // optional, defaults to false (replace mode)
  "expected_version": "2025-10-10T12:00:00.000Z" // required if append=true
}
```

#### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `note_id` | UUID | Yes | The ID of the note to update |
| `content` | string | Yes | Content to write (max 10,240 bytes) |
| `append` | boolean | No | If `true`, append to existing content. Default: `false` |
| `expected_version` | ISO 8601 | Conditional | Required if `append=true`. The `updated_at` timestamp of the note's current version for optimistic locking |

#### Operation Modes

**Replace Mode** (`append: false` or omitted):
- Overwrites entire note content
- `expected_version` is optional

**Append Mode** (`append: true`):
- Adds content to end of existing content (with `\n\n` separator)
- `expected_version` is **required** for optimistic locking
- Returns 409 if note was modified since `expected_version`

#### Response (200 OK)

```json
{
  "note_id": "550e8400-e29b-41d4-a716-446655440000",
  "operation": "replace", // or "append"
  "content_length": 1024,
  "content_hash": "sha256:a3b5c7...",
  "updated_at": "2025-10-10T12:30:00.000Z"
}
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `MISSING_NOTE_ID` | The `note_id` parameter is missing |
| 400 | `MISSING_CONTENT` | The `content` parameter is missing |
| 400 | `INVALID_CONTENT` | Content exceeds 10,240 bytes or contains XSS patterns |
| 400 | `MISSING_EXPECTED_VERSION` | `expected_version` required when `append=true` |
| 401 | `MISSING_AUTH_HEADER` | Authorization header is missing |
| 401 | `INVALID_AUTH_FORMAT` | Authorization header format is incorrect |
| 401 | `INVALID_TOKEN_FORMAT` | Token doesn't match `agent_*` format |
| 401 | `INVALID_TOKEN` | Token not found or revoked |
| 401 | `TOKEN_EXPIRED` | Token has expired (>90 days old) |
| 401 | `TOKEN_AUTO_REVOKED` | Token was auto-revoked due to 10+ failed attempts |
| 403 | `UNAUTHORIZED_NOTE` | Token's user doesn't own this note |
| 404 | `NOTE_NOT_FOUND` | Note with this ID doesn't exist |
| 409 | `VERSION_CONFLICT` | Note was modified since `expected_version` (append mode only) |
| 429 | `RATE_LIMIT_EXCEEDED` | 100 requests/hour limit exceeded |
| 500 | `DATABASE_ERROR` | Database update failed |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

#### Version Conflict Response (409)

```json
{
  "error": "Note has been modified by another process. Please fetch latest version.",
  "code": "VERSION_CONFLICT",
  "current_version": "2025-10-10T12:25:00.000Z"
}
```

#### Content Validation

Content is rejected if:
- Size exceeds 10,240 bytes (10 KiB)
- Contains dangerous XSS patterns:
  - `<script>`, `<iframe>`, `<object>`, `<embed>` tags
  - Event handlers: `onerror=`, `onload=`, etc.
  - `javascript:` protocol

#### Audit Logging

All successful write operations are logged to `agent_write_log` table:
```sql
{
  token_id: UUID,
  note_id: UUID,
  content_hash: "sha256:...", -- SHA-256 hash of final content
  content_length: INTEGER,    -- Size in bytes
  operation_type: "replace" | "append",
  written_at: TIMESTAMP
}
```

---

### 4. Revoke Token

**Endpoint**: `POST /agent-revoke-token`
**Authentication**: User JWT (required)
**Description**: Revokes an agent token, preventing future use.

#### Request

```http
POST /agent-revoke-token
Authorization: Bearer <user_jwt>
Content-Type: application/json

{
  "token_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token_id` | UUID | Yes | The ID of the token to revoke (from token list or generation response) |

#### Response (200 OK)

```json
{
  "message": "Token revoked successfully",
  "token_id": "550e8400-e29b-41d4-a716-446655440000",
  "revoked_at": "2025-10-10T12:00:00.000Z"
}
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `MISSING_TOKEN_ID` | The `token_id` parameter is missing |
| 401 | `UNAUTHORIZED` | Missing or invalid user JWT |
| 403 | `UNAUTHORIZED_TOKEN` | User doesn't own this token |
| 404 | `TOKEN_NOT_FOUND` | Token with this ID doesn't exist |
| 500 | `DATABASE_ERROR` | Database update failed |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

#### Notes

- Revoking an already-revoked token returns 200 (idempotent)
- Revoked tokens cannot be un-revoked
- All pending operations with revoked token will fail with 401

---

## Rate Limiting

### Limits

- **100 requests per hour** per token
- Counter resets exactly 1 hour after first request in period
- Rate limit is enforced atomically (no race conditions)

### Rate Limit Headers

When rate limit is exceeded (429), response includes:

```http
Retry-After: 1800
```

Value is seconds until rate limit reset.

### Rate Limit Tracking

Rate limits are tracked per token in `agent_tokens` table:
- `requests_count`: Current request count
- `rate_limit_reset_at`: Timestamp when counter resets

### How It Works

1. **First request in period**: Set counter to 1, record timestamp
2. **Subsequent requests**: Increment counter
3. **After 1 hour**: Reset counter to 1, update timestamp
4. **When limit exceeded**: Return 429 with `Retry-After` header

---

## Security

### Token Storage

**Server-side** (in database):
- Tokens are bcrypt-hashed with 10 salt rounds
- Only hash and prefix (first 17 chars) are stored
- Plaintext token is **never** stored

**Client-side** (user's environment):
- Store in `.env` file or secure credential manager
- Never commit to version control
- Treat like a password

### Failed Authentication Attempts

The system tracks failed authentication attempts:
- Each failed attempt increments `failed_attempts` counter
- After **10 failed attempts**, token is automatically revoked
- Counter is tied to token, not IP address

### Content Security

All write operations validate content for:
- Size limit (10,240 bytes = 10 KiB)
- XSS patterns (script tags, event handlers, etc.)
- Empty content

### Ownership Verification

All note operations verify:
- Token's `user_id` matches note's `user_id`
- Returns 403 if ownership check fails
- No cross-user access possible

### Optimistic Locking

Append mode uses optimistic locking to prevent lost updates:
1. Client reads note, gets `updated_at` timestamp
2. Client sends update with `expected_version` = `updated_at`
3. Server checks if note's current `updated_at` matches
4. If mismatch, returns 409 (note was modified)
5. Client must fetch latest version and retry

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE"
}
```

Some errors include additional fields:
```json
{
  "error": "Rate limit exceeded (100 requests/hour)",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 1800
}
```

### Error Codes

| Code | Status | Description | Retry? |
|------|--------|-------------|--------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT | No |
| `MISSING_AUTH_HEADER` | 401 | Authorization header missing | No |
| `INVALID_AUTH_FORMAT` | 401 | Wrong header format | No |
| `INVALID_TOKEN_FORMAT` | 401 | Token format incorrect | No |
| `INVALID_TOKEN` | 401 | Token not found/revoked | No |
| `TOKEN_EXPIRED` | 401 | Token > 90 days old | No |
| `TOKEN_AUTO_REVOKED` | 401 | 10+ failed attempts | No |
| `UNAUTHORIZED_NOTE` | 403 | Wrong user | No |
| `UNAUTHORIZED_TOKEN` | 403 | Wrong user | No |
| `NOTE_NOT_FOUND` | 404 | Note doesn't exist | No |
| `TOKEN_NOT_FOUND` | 404 | Token doesn't exist | No |
| `VERSION_CONFLICT` | 409 | Optimistic lock failed | Yes |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit hit | Yes (after delay) |
| `MISSING_NOTE_ID` | 400 | Missing parameter | No |
| `MISSING_CONTENT` | 400 | Missing parameter | No |
| `MISSING_TOKEN_ID` | 400 | Missing parameter | No |
| `MISSING_EXPECTED_VERSION` | 400 | Missing parameter | No |
| `INVALID_CONTENT` | 400 | Content validation failed | No |
| `DATABASE_ERROR` | 500 | Database operation failed | Maybe |
| `VALIDATION_ERROR` | 500 | Token validation failed | Maybe |
| `INTERNAL_ERROR` | 500 | Unexpected error | Maybe |

---

## Usage Examples

### Example 1: Generate Token

```bash
# Get user JWT from Supabase auth
USER_JWT="<your_user_jwt>"

# Generate token
curl -X POST https://ikovzegiuzjkubymwvjz.supabase.co/functions/v1/agent-generate-token \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Claude Code - Desktop"}'

# Response:
# {
#   "token": "agent_abc123def456_longtoken...",
#   "token_id": "550e8400-e29b-41d4-a716-446655440000",
#   "expires_at": "2025-01-08T12:00:00.000Z"
# }

# Save to .env:
echo "NOTED_AGENT_TOKEN=agent_abc123def456_longtoken..." >> .env
```

### Example 2: Read Note

```bash
AGENT_TOKEN="agent_abc123def456_longtoken..."
NOTE_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X GET "https://ikovzegiuzjkubymwvjz.supabase.co/functions/v1/agent-read-note?note_id=$NOTE_ID" \
  -H "Authorization: Bearer $AGENT_TOKEN"
```

### Example 3: Replace Note Content

```bash
AGENT_TOKEN="agent_abc123def456_longtoken..."
NOTE_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X POST https://ikovzegiuzjkubymwvjz.supabase.co/functions/v1/agent-update-note \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note_id": "'"$NOTE_ID"'",
    "content": "# New Title\n\nCompletely new content",
    "append": false
  }'
```

### Example 4: Append to Note (with optimistic locking)

```bash
AGENT_TOKEN="agent_abc123def456_longtoken..."
NOTE_ID="550e8400-e29b-41d4-a716-446655440000"

# First, read note to get current version
RESPONSE=$(curl -s -X GET "https://ikovzegiuzjkubymwvjz.supabase.co/functions/v1/agent-read-note?note_id=$NOTE_ID" \
  -H "Authorization: Bearer $AGENT_TOKEN")

UPDATED_AT=$(echo $RESPONSE | jq -r '.updated_at')

# Then append with expected version
curl -X POST https://ikovzegiuzjkubymwvjz.supabase.co/functions/v1/agent-update-note \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note_id": "'"$NOTE_ID"'",
    "content": "\n\n## Appended Section\n\nNew content added by agent",
    "append": true,
    "expected_version": "'"$UPDATED_AT"'"
  }'
```

### Example 5: Revoke Token

```bash
USER_JWT="<your_user_jwt>"
TOKEN_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X POST https://ikovzegiuzjkubymwvjz.supabase.co/functions/v1/agent-revoke-token \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"token_id": "'"$TOKEN_ID"'"}'
```

---

## Best Practices

### 1. Token Management

 **DO:**
- Store tokens in `.env` files or secure credential managers
- Generate separate tokens for each agent/device
- Give tokens descriptive names
- Revoke tokens when no longer needed
- Monitor token usage in settings

L **DON'T:**
- Commit tokens to version control
- Share tokens between agents
- Log plaintext tokens
- Store tokens in client-side code

### 2. Error Handling

 **DO:**
- Check response status codes
- Parse error codes for programmatic handling
- Respect `Retry-After` headers for 429 errors
- Retry on 409 (version conflicts) with fresh data
- Log errors for debugging

L **DON'T:**
- Assume all requests succeed
- Retry indefinitely on 4xx errors
- Ignore rate limits
- Continue using revoked/expired tokens

### 3. Content Updates

 **DO:**
- Use append mode for adding content
- Include `expected_version` for append operations
- Validate content size before sending
- Handle version conflicts gracefully
- Keep content under 10 KiB

L **DON'T:**
- Use replace mode when you mean append
- Skip optimistic locking in append mode
- Send content with XSS patterns
- Ignore 409 errors

### 4. Rate Limiting

 **DO:**
- Implement exponential backoff for retries
- Cache note content locally when possible
- Batch operations to reduce requests
- Monitor rate limit usage
- Respect `Retry-After` headers

L **DON'T:**
- Make unnecessary requests
- Ignore 429 errors
- Retry immediately without delay
- Poll notes continuously

---

## Changelog

### Version 1.0.0 (2025-10-10)

- Initial release
- 4 endpoints: generate-token, read-note, update-note, revoke-token
- Bcrypt token authentication
- Rate limiting (100 req/hour)
- Optimistic locking for append mode
- XSS content validation
- Audit logging

---

## Support

For issues or questions:
- Check error codes in this documentation
- Review Edge Function logs in Supabase Dashboard
- Check `agent_write_log` table for audit trail

---

**Last Updated**: 2025-10-10
**API Version**: 1.0.0

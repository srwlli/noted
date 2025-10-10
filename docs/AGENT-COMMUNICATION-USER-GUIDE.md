# Agent Communication User Guide

**For**: Noted App Users
**Version**: 1.0.0
**Last Updated**: 2025-10-10

---

## What is Agent Communication?

Agent Communication allows AI assistants (like Claude Code, GitHub Copilot, or custom AI agents) to **read and write your notes** directly. This enables powerful workflows where AI can:

- =Ö **Read** your notes to understand context
-  **Write** new notes based on conversations
- • **Append** updates to existing notes
- = **Sync** information between tools

All operations are **secure**, **rate-limited**, and **fully auditable**.

---

## Getting Started

### Step 1: Generate a Token

1. Open the **Noted** app
2. Go to **Settings** (bottom tab)
3. Expand **Agent Communication** section
4. Tap **Generate New Token**
5. (Optional) Enter a name like "Claude Code - Desktop"
6. Tap **Generate**

### Step 2: Save Your Token

  **IMPORTANT**: The token will **only be shown once**!

The modal will display your token:
```
agent_abc123def456_longrandomstringherewithmorerandomcharacters1234567890
```

**You must copy it before closing the modal.**

#### Where to Save It

**Option A: Environment File (.env)**
```bash
# Add to your .env file
NOTED_AGENT_TOKEN=agent_abc123def456_longrandomstringhere...
```

**Option B: Secure Credential Manager**
- 1Password, Bitwarden, etc.
- Store as "Noted Agent Token"

**Option C: Claude Code Settings**
- Store in your AI assistant's configuration
- Refer to your assistant's documentation

### Step 3: Use with Your AI Agent

Once your AI agent has the token, it can:
- Read your notes by ID
- Create new content
- Update existing notes
- All while you work!

---

## Managing Tokens

### View Your Tokens

In **Settings ’ Agent Communication**, you'll see a list of all your tokens:

**Each token shows:**
- <÷ **Name**: What you called it
- = **Token Prefix**: First 17 characters (e.g., `agent_abc123def4`)
- =Ê **Status**: Active, Expired, or Revoked
- =Å **Created**: When you generated it
- ð **Last Used**: Most recent activity
- =È **Requests**: Total API calls made

### Token Status

#### =â Active
- Token is working normally
- Expires in 90 days from creation
- Can revoke anytime

#### =á Expired
- 90 days have passed since creation
- No longer works
- Generate a new token

#### =4 Revoked
- You manually revoked it
- Or auto-revoked after 10 failed login attempts
- Cannot be reactivated

### Revoke a Token

If you need to disable a token:

1. Go to **Settings ’ Agent Communication**
2. Find the token in your list
3. Tap **Revoke Token** button (on active tokens)
4. Confirm revocation

**When to revoke:**
- You lost the token
- Suspicious activity
- No longer using that AI agent
- Token was compromised

---

## Security

### How Tokens Work

**Your token is like a password:**
- 64 characters long
- Cryptographically secure
- Bcrypt-hashed in our database
- We **never** store the plaintext

**Format:**
```
agent_[12_random_chars]_[52_random_chars]
```

Example:
```
agent_xy7k3m9q2p4w_longrandomstringwith52morecharactersofentropy
```

### Security Features

 **Automatic Expiry**: Tokens expire after 90 days

 **Rate Limiting**: 100 requests per hour per token

 **Auto-Revocation**: After 10 failed login attempts

 **Audit Logging**: All write operations are logged

 **Ownership Protection**: Agents can only access **your** notes

 **Content Validation**: XSS prevention, 10 KiB size limit

### Best Practices

####  DO

- **Generate separate tokens** for each device/agent
- **Give descriptive names** (e.g., "MacBook - Claude Code")
- **Store securely** in `.env` files or credential managers
- **Revoke immediately** if compromised
- **Monitor usage** in settings

#### L DON'T

- **Commit to Git** (add `.env` to `.gitignore`)
- **Share tokens** between agents
- **Post publicly** (GitHub issues, Discord, etc.)
- **Log plaintext** tokens in your code
- **Ignore expired** tokens (generate new ones)

---

## Understanding Rate Limits

### What is Rate Limiting?

To prevent abuse, each token is limited to:
- **100 requests per hour**
- Counter resets after 1 hour

### What Counts as a Request?

-  Reading a note
-  Writing/updating a note
- L Token generation (doesn't count)
- L Token revocation (doesn't count)

### What Happens When You Hit the Limit?

Your AI agent will receive an error:
```json
{
  "error": "Rate limit exceeded (100 requests/hour)",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 1800
}
```

The `retry_after` value tells you how many seconds to wait.

### Tips to Avoid Rate Limits

- **Batch operations** when possible
- **Cache note content** locally
- **Don't poll** continuously
- **Wait between requests** if doing many operations

---

## Use Cases

### 1. Claude Code Integration

**Scenario**: You're coding with Claude Code and want it to take notes about your project.

**Setup**:
1. Generate token in Noted app
2. Add to `.env`: `NOTED_AGENT_TOKEN=agent_...`
3. Tell Claude Code: "Read my note titled 'Project Ideas' and append a new section about today's progress"

**Result**: Claude reads your note, understands context, and appends new content.

### 2. Task Automation

**Scenario**: Daily standup notes generated automatically.

**Setup**:
1. Generate token
2. Create automation script that:
   - Reads your calendar
   - Writes daily summary to Noted
   - Runs every morning at 9am

**Result**: Automatic note creation without manual entry.

### 3. AI Research Assistant

**Scenario**: You're researching a topic and want AI to compile findings.

**Setup**:
1. Generate token
2. Tell AI: "Research quantum computing and update my note with key findings"

**Result**: AI fetches information and appends to your existing research note.

### 4. Meeting Notes

**Scenario**: AI transcribes and summarizes meetings.

**Setup**:
1. Generate token
2. Use AI transcription tool
3. AI writes formatted notes to Noted

**Result**: Meeting notes appear in Noted automatically.

---

## Troubleshooting

### "Token not found or revoked"

**Cause**: Token was revoked or expired.

**Solution**:
1. Check Settings ’ Agent Communication
2. Look for revoked/expired tokens
3. Generate a new token
4. Update your AI agent's configuration

---

### "Rate limit exceeded"

**Cause**: More than 100 requests in the past hour.

**Solution**:
1. Wait for rate limit reset (check `retry_after` seconds)
2. Review your AI agent's usage
3. Optimize to make fewer requests
4. Consider caching note content

---

### "Note not found"

**Cause**: Note ID doesn't exist or was deleted.

**Solution**:
1. Verify note still exists in Noted app
2. Check note ID is correct
3. Ensure you're using the right account

---

### "Content too large"

**Cause**: Trying to write more than 10,240 bytes (10 KiB).

**Solution**:
1. Split content into multiple notes
2. Reduce content size
3. Remove unnecessary text

---

### "Version conflict"

**Cause**: Note was modified while AI was writing (append mode only).

**Solution**:
1. AI will automatically retry with latest version
2. If persists, check for other agents/apps modifying notes
3. Wait a moment and try again

---

### "Token shown only once and I forgot to copy it"

**Cause**: Closed modal without copying token.

**Solution**:
1. **Token is permanently lost** (for security)
2. Generate a new token
3. This time, copy it before closing!

---

## Privacy & Data

### What Data is Shared with AI Agents?

When you generate a token and give it to an AI agent:

** Agent CAN access:**
- Your notes' **titles** and **content**
- Note **creation** and **update** timestamps
- Only notes **you own** (never other users')

**L Agent CANNOT access:**
- Your email or profile information
- Other users' notes
- Your Supabase credentials
- Notes you don't own

### Where is Data Stored?

- **Tokens**: Hashed in Supabase database
- **Notes**: Stored in Supabase (your data)
- **Audit Logs**: Write operations logged to `agent_write_log` table

### Can I Delete Audit Logs?

Audit logs are for security and debugging. They contain:
- Which token made the request
- When it happened
- SHA-256 hash of content (not plaintext)

Contact support if you need logs removed.

---

## FAQ

### How many tokens can I create?

There's **no limit**! Create as many as you need for different agents/devices.

### Can I rename a token after creation?

Not yet. If you need a different name:
1. Revoke the old token
2. Generate a new one with the desired name

### Do tokens cost money?

**No!** Token generation and management are free. Rate limits prevent abuse.

### Can agents delete my notes?

**No.** Agents can only:
- Read notes
- Write new content
- Update existing content

Notes can only be deleted from the Noted app.

### What if I lose my phone?

If your phone is lost:
1. Log into Noted on another device
2. Go to Settings ’ Agent Communication
3. Revoke all tokens
4. Generate new ones

Your notes are safe in the cloud.

### Can I use the same token on multiple devices?

**Yes**, but it's not recommended. Best practice:
- Generate separate tokens for each device
- Easier to track usage
- Revoke one without affecting others

---

## Advanced Usage

### For Developers

See **[Agent Communication API Documentation](./AGENT-COMMUNICATION-API.md)** for:
- API endpoint details
- Request/response formats
- Error codes
- Code examples

### Building Your Own Agent

You can build custom agents that:
1. Authenticate with your token
2. Make HTTP requests to Noted API
3. Read/write notes programmatically

**Example** (Node.js):
```javascript
const NOTED_TOKEN = process.env.NOTED_AGENT_TOKEN;
const BASE_URL = 'https://ikovzegiuzjkubymwvjz.supabase.co/functions/v1';

async function readNote(noteId) {
  const response = await fetch(`${BASE_URL}/agent-read-note?note_id=${noteId}`, {
    headers: {
      'Authorization': `Bearer ${NOTED_TOKEN}`
    }
  });
  return await response.json();
}
```

---

## Getting Help

### In-App Support

- Check Settings ’ Agent Communication for token status
- Review `agent_write_log` table in Supabase for audit trail

### Documentation

- **API Docs**: `docs/AGENT-COMMUNICATION-API.md`
- **User Guide**: This document

### Contact

For bugs, feature requests, or questions:
- Open an issue on GitHub
- Contact support

---

## What's Next?

Future features planned:
- Token usage analytics
- Email notifications for suspicious activity
- Fine-grained permissions (read-only tokens)
- Token expiry customization
- Webhook support

Stay tuned for updates!

---

**Last Updated**: 2025-10-10
**Version**: 1.0.0

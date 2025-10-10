# AI Integration Guide

**Status**: Ready to Implement
**APIs**: Claude (Anthropic) + Perplexity AI
**Version**: 1.0.0

**⚠️ IMPORTANT**: This is an agentic coding environment. Do NOT include time estimates in implementation plans. Focus on clear, actionable steps and deliverables.

**📘 See Also**: [AGENT-ENGAGEMENT.md](./AGENT-ENGAGEMENT.md) - Agent Communication System for AI agents to read/write notes via API (production-ready, 100% test pass rate)

---

## Overview

This guide outlines the integration of AI-powered features into the Noted app using **Claude API** (content generation) and **Perplexity API** (web research). The implementation follows a three-phase approach, building from foundation to advanced features.

### Why These APIs?

**Claude (Anthropic)**
- 50% faster and 30% cheaper than GPT-4o-mini
- 200K context window (57% larger than OpenAI)
- Superior instruction following and markdown understanding
- Reliable JSON structured outputs
- Excellent at brevity (perfect for titles)

**Perplexity**
- Built-in web search with automatic citations
- Real-time information without vector database setup
- Lower latency than full RAG implementation
- Native hybrid RAG (user notes + web knowledge)

---

## The Three Phases

### Phase 1: Foundation & Quick Wins
**Priority**: HIGH

**Features:**
1. **Smart Note Titles** (Claude Haiku)
   - Auto-generate descriptive titles from note content
   - ✨ Generate Title button in editor header
   - Cost: $0.0001 per request

2. **AI Summarization** (Claude Haiku)
   - Auto-generate concise summaries for note previews
   - Cached in database to reduce API calls by 90%
   - Cost: $0.0002 per note

3. **Service Infrastructure**
   - Build foundational AI service layer
   - Error handling and rate limiting
   - Environment configuration

**Deliverables:**
- Smart titles operational
- Summaries cached in database
- AI service foundation complete
- Rate limiting implemented

---

### Phase 2: Research & Categorization
**Priority**: HIGH

**Features:**
1. **Web-Enhanced Notes** (Perplexity Sonar)
   - Real-time web research directly in markdown editor
   - 🔍 Research button in toolbar
   - Auto-formats results with citations
   - Cost: $0.003 per request

2. **Smart Categorization** (Claude Haiku JSON mode)
   - Auto-suggest tags, categories, and folders
   - One-tap to accept all suggestions
   - Cost: $0.0002 per note

**Deliverables:**
- Web research integrated
- Auto-tagging working
- Folder suggestions operational
- Citation display complete

---

### Phase 3: Advanced Features
**Priority**: MEDIUM

**Features:**
1. **Content Enhancement** (Claude Sonnet)
   - AI-powered text improvement
   - 5 modes: Grammar, Expand, Simplify, Professional, Casual
   - Before/after comparison modal
   - Cost: $0.001-0.003 per enhancement

2. **Ask Your Notes** (Perplexity + Local Search)
   - Chat interface combining notes + web knowledge
   - Hybrid RAG with source citations
   - Chat history persistence
   - Cost: $0.002-0.005 per query

**Deliverables:**
- Enhancement tools working
- Chat interface complete
- Hybrid RAG operational
- All Phase 3 features deployed

---

## Cost Estimates

### Per-User Monthly Costs
- **Light user** (10 notes): **$0.01/month**
- **Medium user** (100 notes): **$0.20/month**
- **Heavy user** (500 notes): **$1-2/month**

### Cost Optimization
- Cache summaries aggressively (90% reduction)
- Use Claude Haiku for simple tasks (5-10x cheaper)
- Batch requests where possible
- Per-user rate limits (100 requests/day)
- Only regenerate when content changes >20%

---

## Getting Started

**⚠️ NOTE**: This guide describes the original approach with server-side API keys. For the reusable **BYOK (Bring Your Own Key)** module implementation, see `improvements/ai-byok-implementation-plan.json` which allows users to add their own API keys (zero cost to you).

### 1. Obtain API Keys
```bash
# Claude API
https://console.anthropic.com/

# Perplexity API
https://perplexity.ai/settings/api
```

### 2. Configure Environment
```bash
# Option A: BYOK Module (Recommended for reusable module)
# Users add their own keys via Settings → AI Features
# See improvements/ai-byok-implementation-plan.json for implementation

# Option B: Server-side keys (Original approach)
# Add to Supabase secrets or Vercel env vars
ANTHROPIC_API_KEY=sk-ant-api03-...
PERPLEXITY_API_KEY=pplx-...
AI_RATE_LIMIT_PER_USER=100
ENABLE_AI_FEATURES=true
```

### 3. Create Service Layer
```typescript
// services/ai/claude.ts
export async function generateTitle(content: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 50,
    temperature: 0.3,
    messages: [{
      role: 'user',
      content: `Generate a concise, descriptive title (max 50 chars) for this note:\n\n${content.slice(0, 2000)}`
    }]
  });
  return response.content[0].text.trim();
}
```

### 4. Database Migrations
```sql
-- Phase 1: AI Summaries
ALTER TABLE notes ADD COLUMN ai_summary TEXT;
ALTER TABLE notes ADD COLUMN summary_generated_at TIMESTAMP;
CREATE INDEX idx_notes_ai_summary ON notes(user_id) WHERE ai_summary IS NOT NULL;

-- Phase 2: AI Metadata
ALTER TABLE notes ADD COLUMN ai_category TEXT;
ALTER TABLE notes ADD COLUMN ai_tags TEXT[];
ALTER TABLE notes ADD COLUMN ai_analyzed_at TIMESTAMP;
```

---

## Implementation Roadmap

### Phase 1 Tasks
1. Create `services/ai/claude.ts` and `perplexity.ts`
2. Add API keys to environment
3. Implement Smart Titles
4. Add Generate Title button to editor
5. Implement Auto-Summarization
6. Run database migration
7. Update NoteItem to display summaries
8. Add error handling and rate limiting
9. Test in development and staging

### Phase 2 Tasks
1. Implement Perplexity research modal
2. Add Research button to toolbar
3. Implement Claude-based categorization
4. Add tag suggestions UI
5. Implement folder auto-suggestions
6. Run metadata migration
7. Test research with citations
8. User acceptance testing

### Phase 3 Tasks
1. Implement content enhancement
2. Add Enhance dropdown to toolbar
3. Create before/after comparison modal
4. Implement Ask Your Notes chat
5. Build hybrid RAG
6. Add chat history persistence
7. Implement source citations UI
8. Final testing and deployment

---

## Technical Architecture

### New Files to Create
```
services/ai/
├── claude.ts          # Claude API integration
├── perplexity.ts      # Perplexity API integration
├── ask-notes.ts       # Hybrid RAG implementation
├── index.ts           # Unified exports
└── types.ts           # TypeScript interfaces

lib/
├── anthropic.ts       # Anthropic client config
└── perplexity.ts      # Perplexity API wrapper

components/ai/
├── ai-button.tsx      # Reusable AI action button
├── ai-loading.tsx     # Loading animations
├── ai-badge.tsx       # "AI Generated" badge
├── ask-notes-interface.tsx  # Chat UI
├── chat-message.tsx   # Message component
└── source-citation.tsx  # Citation display

components/markdown/
├── research-modal.tsx # Perplexity research UI
└── enhance-modal.tsx  # Enhancement comparison
```

### Components to Modify
- `app/note-editor/new.tsx` - Add Generate Title button
- `app/note-editor/[id].tsx` - Add Generate Title button
- `components/markdown/markdown-toolbar.tsx` - Add Research and Enhance
- `components/note-item.tsx` - Display AI summaries
- `components/common-header.tsx` - Add Ask Notes icon (optional)

---

## Success Metrics

### Adoption
- % of users trying AI features initially (target: 40%+)
- % of notes with AI-generated titles (target: 30%+)
- % of notes with AI summaries (target: 50%+)
- AI requests per active user (target: 5+ per session)

### Quality
- Title acceptance rate (target: 70%+)
- Summary usefulness rating (target: 4/5+)
- Enhancement acceptance rate (target: 70%+)
- Research feature usage (target: 20%+ of notes)

### Engagement
- Average AI requests per user (target: 15+ per period)
- Time spent in chat interface (target: 5+ min per session)
- AI suggestion acceptance (target: 60%+)

### Business
- Cost per user (target: <$0.50 per period)
- Retention improvement (target: +15%)
- User satisfaction (target: 4.5/5)

---

## Testing Strategy

### Unit Tests
- Test AI service methods with mocked responses
- Test rate limiting logic
- Test caching mechanisms
- Test error handling

### Integration Tests
- Test title generation workflow
- Test summarization with database caching
- Test research modal with Perplexity API
- Test enhancement UI
- Test chat interface with hybrid RAG

### Personal Testing
- Test each feature with real notes
- Collect personal feedback on AI quality
- Measure actual vs estimated costs
- Test on all target devices/platforms
- Verify offline/error handling

---

## Rollout Strategy

### Development & Testing
- **Environment**: Personal development app (single user)
- **Testing approach**: Implement and test each feature individually
- **Feature flags**: Enable AI features via environment variable
- **Monitoring**: Track costs, error rates, and performance

### Implementation Notes
- Test each feature thoroughly before moving to next phase
- Monitor API costs closely during development
- Collect personal usage feedback and iterate
- Document any issues or improvements needed

---

## ⚠️ Critical Implementation Concerns

### Concurrent Request Handling
**CRITICAL**: User repeatedly clicking "Generate Title" can trigger multiple API calls costing $0.0001 each.

**Solution**:
- Button disabled during request (`isGenerating` state)
- Client-side debouncing (300ms delay)
- Show loading spinner during API call
- Re-enable only on success or error

**Implementation**:
```typescript
const [isGenerating, setIsGenerating] = useState(false);

const handleGenerateTitle = async () => {
  if (isGenerating) return; // Guard clause
  setIsGenerating(true);
  try {
    const title = await generateTitle(content);
    setTitle(title);
    toast.success('Title generated!');
  } catch (error) {
    toast.error('Failed to generate title');
  } finally {
    setIsGenerating(false);
  }
};
```

### Timeout Values
- **Generate Title**: 30 seconds (Haiku responds in 1-3s typically)
- **Summarize**: 45 seconds (longer input, 5-10s expected)
- **Verify Keys**: 10 seconds (minimal test request)
- **Research**: 60 seconds (Perplexity may take 10-20s)

### Error Code Constants
All AI errors must use standardized codes for programmatic handling (see `services/ai/errors.ts`):
- `NO_API_KEY_CONFIGURED` (400) - User hasn't added keys
- `INVALID_API_KEY` (401) - Key format wrong or API rejected
- `API_RATE_LIMIT_EXCEEDED` (429) - Hit API rate limit
- `API_REQUEST_TIMEOUT` (504) - Request took too long
- `SERVICE_UNAVAILABLE` (503) - API is down
- `NETWORK_ERROR` (null) - Client network issue

---

## Risk Mitigation

### Technical Risks

**API Rate Limits/Outages**
- Implement exponential backoff
- Show graceful degradation
- Cache aggressively
- Monitor API status pages

**Cost Overruns**
- Per-user daily limits (100 requests/day)
- Budget alerts at $50, $100, $200
- Monitor costs daily
- Implement cost cap per user

**Poor Quality Outputs**
- Thorough prompt engineering
- User feedback collection
- Allow result regeneration
- A/B test prompts

### Privacy & Security
- All API calls through Supabase Edge Functions
- Never expose API keys to client
- Zero data retention policies
- "Private Notes" flag to exclude from AI
- Input validation (prevent prompt injection)
- Encrypt API keys in secrets

---

## Future Enhancements (Phase 4)

### Optional Features
1. **Semantic Search** (pgvector)
   - True vector embeddings
   - Upgrade from text search

2. **Voice Transcription** (Whisper API)
   - Record voice memos
   - AI cleanup and formatting

3. **Duplicate Detection** (Embeddings)
   - Find similar notes
   - Merge suggestions

4. **Smart Reminders** (Claude JSON)
   - Extract action items
   - Deadline detection

### Advanced Features
- Multi-modal analysis (images, PDFs)
- Collaborative notes with AI summaries
- Knowledge graph visualization
- Email-to-note parsing
- External tool integrations

---

## Resources

### Documentation
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Perplexity API](https://docs.perplexity.ai/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

### Dashboards
- [Anthropic Console](https://console.anthropic.com/)
- [Perplexity Dashboard](https://perplexity.ai/settings/api)

### Support
- [Anthropic Discord](https://discord.gg/anthropic)
- Perplexity Support: support@perplexity.ai

---

## Quick Start Checklist

- [ ] Obtain Claude API key
- [ ] Obtain Perplexity API key
- [ ] Add keys to environment
- [ ] Create `services/ai/` folder structure
- [ ] Implement Smart Titles (proof of concept)
- [ ] Test with 5-10 notes
- [ ] Run Phase 1 database migration
- [ ] Add Generate Title button to editor
- [ ] Implement Auto-Summarization
- [ ] Update NoteItem to show AI summaries
- [ ] Add error handling and rate limiting
- [ ] Deploy to staging
- [ ] Beta test with internal users
- [ ] Monitor costs and performance
- [ ] Roll out to production

---

**Last Updated**: 2025-10-06
**Next Steps**: Obtain API keys and begin Phase 1 implementation

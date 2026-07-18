# Steven Agent operations

Steven Agent is a conversational, evolving AI representation of Steven. It uses Muse Spark 1.1 for streamed generation, Postgres for canonical knowledge and conversations, optional Voyage embeddings, and application-side spend enforcement.

## Safety boundaries

- Public retrieval only sees `PUBLIC` chunks included in the current `PUBLISHED` release.
- `PRIVATE` and `NEVER_PUBLISH` records never appear in public retrieval.
- Private model calls stay disabled unless `STEVEN_AGENT_PRIVATE_MODEL_ENABLED=true`.
- Public chat and its API stay unavailable unless `STEVEN_AGENT_PUBLIC_MODEL_ENABLED=true`.
- Steven-specific claims remain grounded in retrieved knowledge. General conversation is allowed without a matching source, but the agent must not invent Steven's personal views or history.
- Muse receives no tools or web-search capability.
- All Meta calls reserve their maximum estimated cost against one shared $5/month provider budget before generation. Public defaults additionally enforce $0.50/day, 10 questions per visitor/day, five/minute, and three concurrent requests.
- Conversations persist until the visitor or owner deletes them. Raw IP addresses and raw session IDs are never stored.

## Setup

1. Copy `.env.example` to an untracked local environment file and fill the required values.
2. Set `AUTH0_ADMIN_SUBS` to Steven's immutable Auth0 `sub`, not an email address.
   Use `/login`; after authentication an unapproved account sees its own subject so it can be added safely.
3. Apply `npx prisma migrate deploy` from `apps/steven-junio`.
4. Open `/admin/agent` and add memories conversationally. Existing portfolio and blog sources can still be managed through the server actions if needed.
5. Configure a paid Meta Model API account and set `META_MODEL_API_KEY`.
6. Leave private calls disabled until Meta's paid data handling, retention, and training terms are explicitly approved.

Owner-added public memories are available to public chat immediately. Traditional portfolio and blog sources still require a published release. Without `VOYAGE_API_KEY`, retrieval uses lexical matching only.

## Memory workflow

The owner uses `/admin/agent` as the primary memory interface. Messages such as “Remember that…” or “Save … to memory” become durable immediately. By default they can inform the public agent; including “private,” “never publish,” or similar language stores them as owner-only.

The composer accepts `.txt`, `.md`, `.pdf`, and `.docx` files up to 10 MB. Uploaded files become immutable, chunked knowledge revisions. They follow the same public-by-default and explicitly-private language rule.

Publishing creates a new immutable snapshot and retires the previous release. A source classified public does not become visitor-visible merely because it exists.

The older candidate-review tables remain compatible with MCP memory proposals, but chat-originated owner memories do not require a second approval step because the authenticated owner is already the authority.

## API and MCP

- `POST /api/v1/agent/public/chat`
- `POST /api/v1/agent/private/chat`
- `GET|DELETE /api/v1/agent/{scope}/conversations/:id`
- `POST /mcp` using MCP Streamable HTTP JSON-RPC

The MCP resource uses Auth0 bearer tokens with the configured audience and supports:

- `steven:ask` — `ask_steven`
- `steven:search` — `search_steven_knowledge`
- `steven:memory:propose` — `propose_steven_memory`

Only subjects listed in `AUTH0_ADMIN_SUBS` are accepted, even when a token has the requested scope.

Register `https://www.stevenjunio.com/auth/callback` as an Auth0 Allowed Callback URL and `https://www.stevenjunio.com` as an Allowed Logout URL. The `/login` page is only an authentication entry point; it never grants access without the server-side subject allowlist.

## Operational checks

- Monitor `AgentRun` for latency, errors, actual token usage, and cost.
- Monitor `UsageBucket` and `UsageLedger` for reserved versus committed spend.
- Use the shared Meta provider budget as the primary circuit breaker; Meta rate limits and its dashboard email alert are not dollar cutoffs.
- Set `META_MODEL_API_KEY` to an invalid/empty value to disable all model calls immediately.
- Retire a public release or turn off a source's `modelAccess` to remove knowledge from future retrieval.

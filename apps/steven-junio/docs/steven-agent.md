# Steven Agent operations

Steven Agent is a source-grounded AI representation of Steven. It uses Muse Spark 1.1 for generation, Postgres for canonical knowledge and conversations, optional Voyage embeddings, and application-side spend enforcement.

## Safety boundaries

- Public retrieval only sees `PUBLIC` chunks included in the current `PUBLISHED` release.
- `PRIVATE` and `NEVER_PUBLISH` records never appear in public retrieval.
- Private model calls stay disabled unless `STEVEN_AGENT_PRIVATE_MODEL_ENABLED=true`.
- Every generated factual answer must contain a valid retrieved-source citation. Answers without one become an abstention.
- Muse receives no tools or web-search capability.
- Public calls reserve their maximum estimated cost before generation. Defaults are $0.50/day, $5/month, 10 questions per visitor/day, five/minute, and three concurrent requests.
- Conversations persist until the visitor or owner deletes them. Raw IP addresses and raw session IDs are never stored.

## Setup

1. Copy `.env.example` to an untracked local environment file and fill the required values.
2. Set `AUTH0_ADMIN_SUBS` to Steven's immutable Auth0 `sub`, not an email address.
3. Apply `npx prisma migrate deploy` from `apps/steven-junio`.
4. Open `/admin/knowledge`, select **Sync portfolio + blog**, review the sources, then publish a named release.
5. Configure a paid Meta Model API account and set `META_MODEL_API_KEY`.
6. Leave private calls disabled until Meta's paid data handling, retention, and training terms are explicitly approved.

Without a published release, the public agent intentionally abstains. Without `VOYAGE_API_KEY`, retrieval uses lexical matching only.

## Knowledge workflow

The admin can add pasted Markdown/plain text or upload `.txt`, `.md`, `.pdf`, and `.docx` files up to 10 MB. Each edit creates an immutable revision and fresh chunks. `modelAccess` can independently prevent an approved source from being sent to any model.

Publishing creates a new immutable snapshot and retires the previous release. A source classified public does not become visitor-visible merely because it exists.

Private chat messages containing “remember” create memory candidates. MCP clients may also call `propose_steven_memory`. Steven must approve each candidate in `/admin/agent` before it becomes a durable fact.

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

## Operational checks

- Monitor `AgentRun` for latency, errors, actual token usage, and cost.
- Monitor `UsageBucket` and `UsageLedger` for reserved versus committed spend.
- Use the public budget as the primary circuit breaker; Meta rate limits are not a dollar cap.
- Set `META_MODEL_API_KEY` to an invalid/empty value to disable all model calls immediately.
- Retire a public release or turn off a source's `modelAccess` to remove knowledge from future retrieval.

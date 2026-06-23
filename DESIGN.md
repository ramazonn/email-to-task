# DESIGN.md

## What we built

NestJS service: inbound email webhook → MongoDB → BullMQ → OpenAI classification → tenant-scoped `Task` (human review via REST).

```
POST /email/inbound/webhook  →  persist EmailMessage  →  queue job
BullMQ worker                →  resolve tenant (to email)  →  OpenAI extract
                           →  actionable? create Task (PENDING_REVIEW) : SKIPPED
GET /tasks + POST /tasks/:id/review  →  tenant via x-company-api-key
```

**Layers:** `api/` (HTTP) → `domain/` (entities + repositories) → `database/` (Mongoose). Workers in `services/emailProcessing/`. Winston file logging with operation audit trail.

**Also shipped:** Company/User CRUD (Basic Auth), `GET /health` (Mongo + Redis ping), multilingual errors (`en`/`ru`/`uz`).

## What we cut

| Cut | Why |
|-----|-----|
| JWT / OAuth | Time box; tenant auth = company `apiKey` header |
| CC / multi-recipient | Single `to` for unambiguous tenant resolution |
| PII redaction before OpenAI | Documented gap in THREATS.md |
| Push notifications | Pull-based review queue only |
| Live OpenAI in CI | Mock/schema tests only |

## Tradeoffs

- **apiKey header vs JWT:** Fast to ship; apiKey is a bearer secret — protect admin routes (Basic Auth on `/companies`, `/users`, webhook).
- **Webhook always 202:** Provider-friendly; client reads `data.status` (`queued`, `already_exists`, `internal_error`).
- **Human review gate:** LLM never final — all tasks start `PENDING_REVIEW`.
- **4k email truncation:** Cost/latency vs full-body analysis.
- **autoIndex: false:** Indexes defined in schemas; ops must ensure they exist in prod.

## Another week

1. JWT + membership; rotate/revoke apiKeys without exposing in list APIs.
2. Unique-task + transactional email→task; reconcile `RECEIVED` emails that failed enqueue.
3. PII redaction / data-processing controls before third-party LLM.
4. Processor + OpenAI integration tests; queue observability dashboard.
5. SPF/DKIM or signed webhook payloads from email provider.
6. Implement CI/CD to automate deployment

# Email-to-Task Pipeline

NestJS service: ingest emails via webhook, classify with OpenAI, create tenant-scoped tasks for human review.
## How it works

When an inbound email is received (via a POST request to the webhook), the service immediately saves the message and pushes a job onto a queue. This queue is managed by BullMQ, allowing heavy processing tasks (like running OpenAI classification or extracting structured data) to be handled by a background worker process instead of blocking the HTTP request.

This design ensures the webhook remains fast and reliable, while more intensive work (classification, tenant resolution) happens asynchronously in the background. Once the background processor completes its work, actionable emails result in a `Task` being created and marked for human review, all fully scoped to the correct tenant.

## Start the app

**Prerequisites:** MongoDB and Redis running locally (defaults in `.env.example`: `localhost:27017`, `localhost:6379`).

You will receive `.env` values via Telegram. Place them in `.env` at the project root (or copy from `.env.example`).

```bash
cd backend
npm install
npm run seed                  # default test data (see below)
npm run start:dev             # http://localhost:3000
```

**Swagger UI:** http://localhost:3000/docs — click **Authorize** once:
1. **basicAuth** — `WEBHOOK_BASIC_AUTH_USER` / `WEBHOOK_BASIC_AUTH_PASS`
2. **tenantCompanyApiKey** — `company-1-api-key-test` (after seed)

Authorization persists across requests (`persistAuthorization: true`).

**Health check:** `GET /health` → `{ status, mongo, redis }`

## Default seed data

| Company | API key (`x-company-api-key`) | User email (`to` for webhook) |
|---------|-------------------------------|-------------------------------|
| Company 1 | `company-1-api-key-test` | `ramazon1@gmail.com` |
| Company 2 | `company-2-api-key-test` | `ramazon2@gmail.com` |

Re-run `npm run seed` only on a **fresh** database (it creates new rows; no wipe).

## End-to-end test flow

### 1. Inbound email — `POST /email/inbound/webhook`

Basic Auth required. Send to a seeded user email so tenant resolution works.

**Actionable example** (should create a task):

```bash
curl -X POST http://localhost:3000/email/inbound/webhook \
  -u "$WEBHOOK_BASIC_AUTH_USER:$WEBHOOK_BASIC_AUTH_PASS" \
  -H "Content-Type: application/json" \
  -d '{
    "providerMessageId": "test-actionable-001",
    "from": "client@example.com",
    "to": "ramazon1@gmail.com",
    "subject": "Please review the contract by Friday",
    "text": "Hi, can you review the contract and send feedback by Friday? This blocks our signing meeting."
  }'
```

**Non-actionable example** (should be skipped, no task):

```bash
curl -X POST http://localhost:3000/email/inbound/webhook \
  -u "$WEBHOOK_BASIC_AUTH_USER:$WEBHOOK_BASIC_AUTH_PASS" \
  -H "Content-Type: application/json" \
  -d '{
    "providerMessageId": "test-newsletter-001",
    "from": "news@vendor.com",
    "to": "ramazon1@gmail.com",
    "subject": "Monthly newsletter",
    "text": "Thanks for subscribing. Here are this month updates. No action required."
  }'
```

Response is always **202**. Check `data.status`: `queued`, `already_exists`, etc.

Worker runs async — watch `logs/operation.log` for `PROCESS_INBOUND_EMAIL`, `CLASSIFY_EMAIL`, `CREATE_TASK_FROM_EMAIL`.

### 2. List tasks — `GET /tasks`

```bash
curl http://localhost:3000/tasks \
  -H "x-company-api-key: company-1-api-key-test"
```

Optional query: `?status=PENDING_REVIEW&page=1&limit=20`

### 3. Review task — `POST /tasks/:id/review`

```bash
curl -X POST "http://localhost:3000/tasks/TASK_ID/review" \
  -H "x-company-api-key: company-1-api-key-test" \
  -H "Content-Type: application/json" \
  -d '{ "decision": "accept" }'
```

`decision`: `accept` | `reject`. Only `PENDING_REVIEW` tasks can be reviewed.

## Other APIs

| Route | Auth |
|-------|------|
| `POST/GET/PUT/DELETE /companies` | Basic Auth |
| `POST/GET/PUT/DELETE /users` | Basic Auth |
| `GET /tasks`, `POST /tasks/:id/review` | `x-company-api-key` |
| `POST /email/inbound/webhook` | Basic Auth |
| `GET /health` | None |

## Scripts

- `npm run start:dev` — dev server
- `npm run seed` — seed companies + users
- `npm test` / `npm run test:e2e` — tests
- `npm run build:swagger` — regenerate `public/swagger.json`

## Docs

- [DESIGN.md](./DESIGN.md) — architecture, cuts, tradeoffs
- [THREATS.md](./THREATS.md) — abuse cases and mitigations

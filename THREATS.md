# THREATS.md

## Prompt injection (email body)

**Risk:** Malicious text manipulates the LLM.

**Mitigations:** `<email>` delimiters; system prompt marks body untrusted; structured JSON output + zod validation; 4k truncation; content failures skip retry; human review is final trust boundary.

**Gap:** Determined adversaries may still bias classification.

## Cross-tenant IDOR

**Risk:** Guessing another tenant's task `_id`.

**Mitigations:** `x-company-api-key` → server-resolved `companyId`; all queries filter by `companyId`; cross-tenant access returns **404**.

## Webhook / admin abuse

**Risk:** Flooding webhooks → LLM cost; scraping company apiKeys.

**Mitigations:** Basic Auth (`timingSafeEqual`) on webhook, `/companies`, `/users`; throttling; 256 KB body limit; idempotency on `providerMessageId`.

**Gap:** Leaked Basic Auth or apiKey enables abuse — rotate credentials; add IP allowlists in prod.

## Duplicate delivery

**Risk:** Provider retries create duplicate tasks.

**Mitigations:** Unique `providerMessageId`; pre-check before insert; BullMQ `jobId`; worker skips terminal statuses; unique compound index on `(companyId, sourceEmailMessageId)`; review only from `PENDING_REVIEW`.

## LLM hallucination

**Risk:** Invented titles, dates, assignees.

**Mitigations:** `PENDING_REVIEW` gate; raw LLM stored on `EmailMessage`; assignee resolved only via company-scoped user lookup.

## Spoofed email headers

**Risk:** Fake `from`/`to` without SPF/DKIM.

**Acknowledgment:** Exercise premise — tenant trusts provider-delivered `to`. Production needs provider auth + email authenticity checks.

## PII to OpenAI

**Risk:** Sensitive content leaves trust boundary.

**Acknowledgment:** **Not solved.** Production needs redaction, consent, DPA, or private models.

## Credential exposure

**Mitigations:** Secrets in env only; boot validation; no auth logging; `.env` gitignored.

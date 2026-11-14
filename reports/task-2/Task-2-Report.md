# Velcoris Industries — Backend & IT Infrastructure Analysis

Task 2 | Integrated prototype and implementation proposal | 13 November 2026

## Executive recommendation

Keep the existing Vercel website and Zoho email service unless a confirmed requirement justifies migration. Prioritise reliable enquiry capture, protected staff access, observable failures, tested recovery and stronger domain email authentication. Extend the Task 1 redesign with a real enquiry database rather than building a disconnected second prototype.

The practical implementation validates and stores enquiries, returns a saved reference, and retrieves records through an enquiry desk with search, pagination and status updates.

This document presents an independent architecture analysis and implementation proposal based on observable public evidence.

## Method and boundaries

Passive public inspection covered HTTPS response headers, downloaded public HTML and JavaScript bundles, and public DNS answers from Google's DNS-over-HTTPS resolver. The recorded infrastructure snapshot was collected on 13 November 2026 at approximately 22:33 IST. No live company enquiry was submitted, no account was accessed, and no company DNS, hosting or email setting was changed. No port scanning, exploitation, load testing or private data access was performed.

A browser-visible client can reveal its libraries and submission endpoint. It cannot establish the endpoint's storage implementation, retention policy, database permissions, internal cloud configuration or operational reliability. These are recorded as unknowns rather than guessed.

## Deliverable 1 — Existing technologies, hosting and backend

### Observed public evidence

**E1 / Website delivery — Vercel.** Homepage and Contact responses returned HTTP 200 with `Server: Vercel`, `X-Vercel-Cache: HIT` and Vercel request identifiers. This is strong evidence that Vercel serves the inspected routes. It does not establish the full origin architecture, paid plan, deployment pipeline or ownership configuration. [A1]

**E2 / Frontend — React and Vite-related build output.** The HTML references versioned JavaScript assets. Downloaded bundles contain React/ReactDOM code, Vite dependency-preload markers and React Router references. The returned HTML also contains page content and prerender/SSR-related markers. These support a React/Vite-based build with populated HTML; the exact rendering framework, versions and build configuration were not independently established. [A1]

**E3 / Contact submission — Google Apps Script endpoint.** Both the Contact page and floating contact widget import a configured endpoint from the public constants bundle. That endpoint's host is `script.google.com`; the forms issue a JSON-encoded POST with a `text/plain` content type and parse the returned JSON. No POST was made to it in this review. This supports an Apps Script integration, not a conclusion that enquiries are stored in Google Sheets or emailed successfully. The script's implementation remains unknown. [A1]

**E4 / Demo fallback in shipped form code.** The inspected Contact bundle contains a simulated-success path when the endpoint includes `YOUR-DEPLOYMENT-ID`. The current configured constant points to Apps Script; this review does not claim that the fallback is currently active. A production build should fail configuration checks instead of presenting an unpersisted enquiry as successfully queued. [A1]

**E5 / DNS — Wix nameservers.** Public NS answers list `ns10.wixdns.net` and `ns11.wixdns.net`. The apex A answer was `216.198.79.1`; the inspected AAAA query returned no address answer. Nameserver ownership identifies the DNS service, not the web application platform. Wix DNS and Vercel web delivery are compatible observations. [A1]

**E6 / Email — Zoho routing and SPF.** MX records point to `mx.zoho.in`, `mx2.zoho.in` and `mx3.zoho.in`. The public SPF record contains `v=spf1 include:zoho.in ~all`. These indicate Zoho mail routing and an SPF soft-fail policy; they do not prove a particular subscription, mailbox security posture or message delivery rate. [A1, R3]

**E7 / DMARC — monitoring policy.** The inspected DMARC record publishes `p=none` and `sp=none`, with relaxed alignment. Monitoring is useful during rollout but does not request rejection or quarantine for failed authentication. An aggregate-report destination was not present in the observed record. DKIM was not verified because the active selector and signed message headers were unavailable; no selector enumeration was attempted. [A1, R4, R5]

**E8 / Existing web protections and caching.** HTTPS responses include HSTS with a 63,072,000-second maximum age. The inspected document and selected hashed JavaScript responses use `public, max-age=0, must-revalidate` and ETags; cache hits were observed. CSP, X-Content-Type-Options and Referrer-Policy were absent from these response headers. These are hardening opportunities, not proof of an exploitable vulnerability. A wildcard CORS header on public static assets is not by itself a data-exposure finding. [A1]

### Important unknowns

The actual enquiry store, Apps Script source, mail transport outcome, database vendor, database backups, server-side validation, staff authorization, internal devices, MFA adoption, source control, secret management, monitoring and incident response remain unknown. Inspect these with the company's administrators before approving a production migration or claiming that an existing control is absent.

## Deliverable 2 — Backend, database, security and performance improvements

### Recommended production path

Retain the current frontend and Vercel delivery initially. Add or formalise a server-side enquiry API with managed relational storage; a Vercel-compatible API with managed PostgreSQL is a reasonable production option once expected traffic, location, retention and operating budget are confirmed. If Apps Script already meets the operational requirements, improve its validation and durable-write acknowledgement first rather than replacing it solely because of its technology.

The assignment prototype instead uses a dependency-free Worker and managed D1. A relational table fits the small, structured enquiry workload and avoids requiring a separately managed database server. Do not treat the local SQLite adapter as a complete D1 emulator or assume that this demonstration has been capacity-tested.

### Priority controls

- **Durable acknowledgement:** Validate and commit the enquiry before reporting success. Return a stable reference. An email notification alone is not a system of record.
- **Database design:** Store a UUID, request key, contact fields, enquiry purpose, material, message, status, revision and timestamps. Use a unique request key for retries and indexes for time/status queries. Use bound SQL parameters. [R1, R6]
- **Staff access:** Separate public submission rights from internal reading/updating rights. Use individual staff accounts, MFA and explicit roles in production. The current demonstration is intentionally owner-private across the entire Site.
- **Input and abuse controls:** Enforce server-side lengths and allowed values, bound request bodies, rate limits and same-origin mutation checks. Use an accessible anti-bot control only if measured public abuse warrants it. Do not depend on client validation alone.
- **Safe display and failures:** Render messages as text, avoid returning database details, prevent API caching and log a correlation ID without copying the full enquiry into operational logs.
- **Delivery reliability:** For future notifications, save a notification job alongside the enquiry in a transaction or equivalent atomic operation. Process it asynchronously with unique enquiry/job keys, retries and a visible failed state. A failed notification should not erase the saved enquiry. This notification/outbox feature is recommended, not implemented in the prototype.
- **Recovery:** Take encrypted backups or exports, document access ownership and rehearse a restore. D1 also provides plan-dependent Time Travel recovery; verify its current limits and supplement it according to the agreed recovery target. [R2]
- **Privacy and retention:** Collect only useful enquiry fields, publish an approved privacy notice, restrict staff access and agree on retention/deletion rules with the business. No statutory retention period is assumed in this report.

### Performance and deployment

Measure the current site before choosing optimisations. Establish mobile and desktop field/lab baselines; the suggested acceptance targets are LCP <=2.5 seconds, INP <=200 ms and CLS <=0.1 at the 75th percentile. These are reference thresholds, not measured outcomes of this review. [R7]

The observed main JavaScript response declares 206,128 bytes, and the homepage HTML response declares 79,740 bytes in the captured requests. These are individual response sizes under the inspection conditions, not total page weight or compressed transfer measurements. Review route splitting, animation cost, responsive images and below-fold media. Apply long-lived immutable caching to content-hashed assets after confirming invalidation, while keeping HTML appropriately revalidated. Preserve useful prerendered content.

Use version-controlled migrations and a staging environment. Run schema, API, authorization and dependency checks before release. Add availability monitoring, database error alerts and enquiry-failure dashboards. Roll back application code only after checking schema compatibility; an application rollback does not automatically reverse a database migration.

## Deliverable 3 — Internal IT, business email and automation

### Build on the observed Zoho mail setup

Retain Zoho Mail provisionally. First confirm ownership, account inventory, aliases, forwarding, recovery contacts and billing. Enable and verify organisation-wide MFA, use delegated functional mailboxes rather than shared passwords, and remove access promptly during offboarding. No tenant changes were made. [R8]

Audit every authorised sending service before editing SPF. Maintain one SPF record and use the exact regional values supplied by the tenant's administration console. Configure and verify DKIM for all legitimate senders. Add a controlled aggregate DMARC reporting destination; study reports, correct alignment and forwarding issues, then stage enforcement toward quarantine/reject once legitimate mail is accounted for. Do not copy a generic record into production or switch directly to enforcement without delivery testing. [R3, R4, R5]

### Suggested lightweight toolkit

- **Shared documents — Zoho WorkDrive:** A candidate system for versioned technical documents, approved datasheets, policies and onboarding files, with team-level access. Confirm current document tools and plan features before introducing another repository. [R9]
- **Secrets — Zoho Vault:** A candidate for controlled sharing of administrative credentials and recovery material. Keep source/runtime secrets out of ordinary documents and code. Maintain individual access and an emergency recovery process. [R10]
- **Internal requests — Zoho Desk:** Consider a small helpdesk for equipment/access requests with an owner, status and response target. Keep an asset/access register even if a dedicated asset-management tool is not yet justified. Verify suitable plan and workflow features. [R11]
- **Workflow — Zoho Flow:** A candidate for authenticated webhook/API workflows and notifications. Reuse existing licensed tools when they meet the same need. No subscription or automation has been created. [R12]

Because email already routes through Zoho, these candidates may reduce integration effort. That is an inference, not a confirmed cost saving. Compare existing licences, staff familiarity, data-location requirements and total operating cost before purchasing anything. Microsoft 365 or another suite should be considered only if the wider business requirements justify a separate comparison and migration.

### Practical workflows to introduce

1. **Enquiry follow-up:** Saved enquiry -> durable notification job -> assigned sales/technical owner -> acknowledgement -> reminder if unassigned -> escalation -> closure with an outcome. Keep the database reference in all related records and avoid duplicate notifications on retries.
2. **Technical document approval:** Draft -> technical review -> approval -> published revision -> archive previous revision. Record document owner, revision and review date.
3. **Joiner/mover/leaver:** Approved access request -> account/device checklist -> manager confirmation -> periodic review -> timely removal and device return. Keep an auditable record of who approved and completed each step.

Use encrypted, managed devices, supported software, controlled administrative privileges, a documented update process and tested recovery. Device fleet details were not available, so no endpoint product purchase is prescribed.

## Deliverable 4 — Practical query management implementation

### One integrated prototype

The Task 1 contact form now calls `POST /api/enquiries`. Successful validation leads to a parameterized database insert. The response includes the saved UUID and timestamp; the page shows the reference only after that response. No email is sent to Velcoris.

The `/admin` enquiry desk retrieves saved records, searches names/emails/organisations/messages/references, filters by status, paginates 20 records at a time, and updates workflow state. Allowed states are New, In progress and Resolved. Revision checking rejects stale updates instead of silently overwriting another change.

### Architecture and data flow

Browser contact form -> same-origin Worker API -> D1 enquiry table -> saved reference.

Owner sign-in -> private Site boundary -> enquiry desk -> protected query API -> stored records/status updates.

For a local run, the same handler uses a real SQLite file. The local admin API requires a temporary access key printed by the local server. Browser code keeps that key only in memory. Hosted D1 and the local SQLite file are distinct databases.

### Implemented safeguards

Server-side validation, allowed-value lists, a 16 KiB body limit, same-origin mutation checks, a honeypot, a 20-enquiry/10-minute client-window limit, parameterized SQL, text-only record rendering, API no-store responses, defensive response headers, stable retry keys and optimistic status updates are implemented. The rate control is suitable for a private demonstration; it is not a substitute for production public-edge abuse protection.

The hosted admin protection relies on the confirmed owner-private platform boundary. It is not a separate staff role system. Do not change the Site to public access without adding application-level staff authorization. Local API authorization and the deployed platform gate are different controls.

### Schema and API

`enquiries` stores id, unique request key, request hash, name, email, organisation, intent, material, message, status, revision, created_at and updated_at. `rate_limits` stores short-lived hashed client-window counters. Request handling does not create or alter tables; the generated migration owns the schema.

- `POST /api/enquiries`: 201 after a write; 200 for an unchanged retry; 409 if a retry key is reused for changed details; 422 for invalid fields.
- `GET /api/enquiries?q=&status=&page=1`: authorised retrieval, bounded results.
- `PATCH /api/enquiries/:id`: authorised state change with current revision; 409 for a stale revision.
- `GET /api/health`: checks database connectivity.

No deletion, email delivery, CRM integration, attachment upload or production audit-history feature is claimed. The source, generated migration and reproducible test commands are included in the package.

### Verification

Twelve backend tests passed, including persistence after closing/reopening SQLite, duplicate retries, concurrent duplicate requests, validation failures, SQL-shaped text, literal wildcard search, rate limits, unauthorized reads/updates, pagination, stale revisions and database failure handling.

A separate local HTTP smoke test returned 200 for the website and desk, 401 for unauthenticated admin retrieval, 201 for enquiry creation, 200 for authorized retrieval and 200 for a status update. This tests a real server and database rather than browser storage or a mocked success message.

The deployed D1-backed API was also tested: database connectivity 200, anonymous admin access 401, a real write 201, a duplicate retry 200 with the same reference, retrieval 200, status update 200, stale update rejection 409 and successful retrieval of the changed status. The API demonstration reference is `c15d575b-f0c7-4f65-bf61-778e92cecf69`. Machine-readable results are included in `Hosted-Evidence.json`.

The hosted browser workflow was then verified: selecting GO carried it into the form; submitting fictional details displayed reference `55c746d5-c2af-4352-9a63-0180ccca801c`; the enquiry desk retrieved that same record; and the record remained after a page reload. Search, status filtering and an update to Resolved were verified on the API demo record. Desktop inspection used 1280 x 900; the phone enquiry desk had a 375 px document width within a 390 px viewport. Screenshots and `Browser-Evidence.json` are included. This is a focused acceptance check, not comprehensive accessibility, device or performance certification.

## Deliverable 5 — Implementation roadmap, priorities and assumptions

### Phase 1 / Confirm and protect — proposed days 1–2

Owner: website maintainer with the email administrator. Inventory the Apps Script code, actual enquiry store, mail senders, access and existing backups. Remove production demo-success configuration paths. Confirm an accountable owner for enquiries. Review SPF, DKIM and DMARC reporting. Acceptance: a documented system map and a traceable enquiry from submission to stored record; no unverified migration assumptions.

### Phase 2 / Reliable enquiry workflow — proposed days 3–5

Owner: backend developer with a sales/technical representative. Implement or harden durable storage, server validation, staff authorization, reference-based retrieval, status tracking and a recoverable notification queue. Acceptance: valid enquiry survives a restart, unauthorized staff access is rejected, retries do not duplicate it, failed email is observable, and a backup can be restored. The prototype covers the database and core query-management subset, not the full production workflow.

### Phase 3 / Operational readiness — proposed week 2

Owner: IT administrator and website maintainer. Add monitoring, privacy-reviewed retention, a restore runbook, staging/deployment checks and a controlled secret inventory. Review account lifecycle and approved technical document storage. Acceptance: alert and recovery drills, reviewed permissions and agreed support ownership.

### Phase 4 / Optimise and automate — proposed weeks 3–4

Owner: IT lead with business process owners. Measure performance, optimise only demonstrated bottlenecks, pilot one follow-up automation and one document approval flow. Stage email enforcement after reviewing legitimate sender alignment. Acceptance: measured before/after results, no duplicate workflow actions, verified mail delivery and user sign-off.

These are planning estimates for a small team, not deadlines agreed with Velcoris. Proposed starting recovery objectives are RPO 24 hours and RTO 4 hours; the business must approve them and a restore drill must validate them. Budget and staffing were not supplied.

### Operational assumptions

The enquiry volume is assumed to be modest; no load test established capacity. The current hosting and mail services are assumed to be company-controlled, but administrative ownership must be confirmed. Internal tools, licences and staff roles remain unverified.

## Sources

Accessed 13 November 2026. Technical observations are point-in-time evidence; vendor documentation supports capabilities, not proof of Velcoris's configuration.

- A1 — Passive inspection evidence: `Public-Technical-Observations.json`, supported by public HTML, response headers, referenced JavaScript bundles and DNS answers.
- Company website: https://velcorisindustries.com/
- R1 — D1 prepared statements: https://developers.cloudflare.com/d1/worker-api/prepared-statements/
- R2 — D1 recovery: https://developers.cloudflare.com/d1/reference/time-travel/
- R3 — Zoho SPF: https://www.zoho.com/mail/help/adminconsole/spf-configuration.html
- R4 — Zoho DMARC: https://www.zoho.com/mail/help/adminconsole/dmarc-policy.html
- R5 — Zoho DKIM: https://www.zoho.com/mail/help/adminconsole/dkim-configuration.html
- R6 — OWASP SQL injection prevention: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
- R7 — Web Vitals: https://web.dev/articles/vitals
- R8 — Zoho MFA: https://www.zoho.com/mail/help/adminconsole/two-factor-authentication.html
- R9 — WorkDrive: https://www.zoho.com/workdrive/
- R10 — Vault: https://www.zoho.com/vault/
- R11 — Desk: https://www.zoho.com/desk/
- R12 — Flow: https://www.zoho.com/flow/

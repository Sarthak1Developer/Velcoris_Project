# Task 2 verification

Reviewed and implemented 13 November 2026. All stored demonstration records use fictional details.

## Deployment and Access

- The application package runs locally with zero external npm runtime dependencies.
- Can be deployed to serverless platforms such as Cloudflare Workers with D1 storage.

## Backend tests

`npm test`: **12 passed, 0 failed**. Tests use the actual application handler, generated schema and real SQLite storage. They cover valid writes, unauthorized reads/updates, validation, body size/type, origin checks, duplicate retries/races, SQL-shaped strings, escaped search, rate limiting, paging, optimistic updates, database errors and persistence after closing/reopening a file database. The local D1-shaped adapter does not emulate all Cloudflare behaviour.

JavaScript syntax checks and the dependency-free Worker build passed. The generated migration was inspected; a second schema generation reported no schema changes. The runtime has no third-party npm dependencies. Initial developer-tool advisories were resolved with an esbuild 0.28.2 override; the subsequent complete npm audit reported **0 known vulnerabilities** at the time of the check. This is not a guarantee against undisclosed vulnerabilities.

## Real HTTP and hosted API tests

The local HTTP smoke test returned:

- Website and admin HTML: 200.
- Unauthenticated local enquiry list: 401.
- Enquiry write: 201.
- Authorized list retrieval: 200.
- Status update: 200.

`Demo-Evidence.json` contains a later retrieval of the local demo after its update. `Demo-Enquiries.sqlite` is a consistent snapshot whose row matches that response. It contains one local fictional record and is separate from hosted D1.

`Hosted-Evidence.json` records a successful database connection, anonymous list rejection (401), write (201), same-key retry (200, same reference), retrieval (200), update (200), stale update rejection (409), and retrieval of the updated record. No service credential is included in the evidence or source package.

## Hosted browser tests

- The enquiry desk rendered its saved API record at 1280 x 900.
- Searching by reference and filtering In progress returned that record.
- Changing it to Resolved removed it from the In progress filter; filtering Resolved retrieved it again.
- Selecting Graphene Oxide on the website carried GO into the enquiry form.
- Submitting the browser demo produced reference `55c746d5-c2af-4352-9a63-0180ccca801c` and a clear saved receipt.
- Opening the enquiry desk retrieved that same name, message, material and reference.
- Reloading the page retained both hosted records; the browser demo remained New, and the API demo remained Resolved after the UI status change.
- At 390 x 844, the enquiry desk's document width was 375 px, with no horizontal overflow in the inspected state.
- Viewport overrides were reset after checking. The desk tab was retained as a deliverable.

Screenshots: `Saved-Enquiry.jpg`, `Enquiry-Desk.jpg`, `Enquiry-Desk-Mobile.jpg`. Initial local browser navigation timed out, but hosted browser verification subsequently succeeded. The earlier Task 1 browser limitation therefore no longer applies to the integrated enquiry journey checked here.

## Remaining limits

No real Velcoris form was submitted or company system changed. The existing Apps Script's database and delivery behaviour remain unknown. This prototype does not send email, integrate a CRM, implement staff RBAC for a public site, offer deletion/audit history, or establish a production retention policy. Do not make this owner-private Site public without adding independent staff authorization.

There was no load test, real-device matrix, field performance measurement, comprehensive screen-reader/keyboard/zoom audit or disaster recovery drill of the hosted database. Those are production acceptance items, not claims made by this prototype.

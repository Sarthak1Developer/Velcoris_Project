# Velcoris Prototype

A full-stack prototype featuring a modern website redesign for Velcoris Industries and an integrated enquiry management backend with an administrative Enquiry Desk.

## Overview

The prototype includes:
- **Public Website (`public/index.html`):** Interactive product exploration for graphene materials (FLG, GO), applications, and an enquiry submission workflow.
- **Enquiry Desk (`public/admin.html`):** Administrative interface for reviewing, searching, filtering, and updating submitted enquiries.
- **Backend API (`worker/app.mjs`):** Web-standard Request/Response handler supporting local development with Node.js SQLite and deployment to Cloudflare Workers with D1.
- **Schema & Migrations (`db/`, `drizzle/`):** Drizzle ORM schema and versioned SQL migrations.

## Getting Started

### Prerequisites

- Node.js 24.13 or newer (utilizing built-in `node:sqlite`)

### Run Locally

1. Navigate to the prototype directory:
   ```bash
   cd prototype
   ```

2. Start the local server:
   ```bash
   npm start
   ```

3. Open the printed URL in your browser (default: `http://127.0.0.1:8787`).
4. Access the Enquiry Desk at `http://127.0.0.1:8787/admin`.
   - **Access Key:** `oGdQoJ7iEDM8bwIrJT0zl0NcWm7DCjtg` (logged in the terminal on startup).
   - To use a custom key, set the `ADMIN_KEY` environment variable:
     ```bash
     ADMIN_KEY="your-secret-key" npm start
     ```

### Testing and Building

Run automated test suite:
```bash
npm test
```

Execute HTTP integration smoke test:
```bash
node scripts/smoke-http.mjs
```

Build the deployment worker bundle:
```bash
npm run build
```

The output bundle is generated at `dist/server/index.js`.

## Architecture & Directory Structure

- `public/`: Static assets (HTML, CSS, client-side JavaScript).
- `worker/app.mjs`: Core HTTP request router and business logic.
- `db/schema.js`: Drizzle ORM schema definition.
- `drizzle/`: Generated SQL migrations, migration journal, and schema snapshots.
- `scripts/dev.mjs`: Local loopback HTTP server with SQLite database initialization.
- `scripts/local-db.mjs`: SQLite adapter and migration executor.
- `scripts/build.mjs`: Bundles static assets and the worker into a single distributable bundle.
- `tests/`: Integration and unit tests covering validation, security headers, rate limiting, and persistence.

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Connectivity and health check. |
| `POST` | `/api/enquiries` | Public (Same-Origin) | Validates and stores a new enquiry. |
| `GET` | `/api/enquiries` | Protected (Bearer Token) | Lists enquiries with pagination, search, and status filters. |
| `PATCH` | `/api/enquiries/:id` | Protected (Bearer Token) | Updates enquiry status with optimistic concurrency control. |

### Security Measures

- **Same-Origin & CORS Protection:** State-changing endpoints enforce origin and fetch metadata checks.
- **Input Sanitization & Validation:** Strict field bounds, email format validation, and honeypot field checks.
- **SQL Injection Prevention:** Parameterized SQL queries for all database interactions.
- **Rate Limiting:** Sliding-window rate limiting on submissions to prevent spam.
- **Security Headers:** Strict Content Security Policy (`CSP`), `X-Content-Type-Options: nosniff`, and restricted frame ancestors.

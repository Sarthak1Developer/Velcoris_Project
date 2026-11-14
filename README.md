# Velcoris Project

A technical evaluation, website redesign concept, and full-stack enquiry management prototype for Velcoris Industries.

## Project Structure

```
Velcoris_project/
├── prototype/          # Full-stack application and local dev server
│   ├── db/             # Drizzle schema definitions
│   ├── drizzle/        # SQL migration files
│   ├── public/         # Static assets, styling, and client-side logic
│   ├── scripts/        # Dev server, database runner, and build tooling
│   ├── tests/          # Automated test suite
│   └── worker/         # Request routing and database handlers
└── reports/            # Technical evaluations and analysis
    ├── task-1/         # Website analysis and UX redesign report
    └── task-2/         # Backend architecture, IT infrastructure analysis, and verification
```

## Quick Start

### Prerequisites

- Node.js 24.13+ (requires built-in `node:sqlite` support)

### Running the Prototype

1. Navigate to the prototype directory:
   ```bash
   cd prototype
   ```

2. Start the local server:
   ```bash
   npm start
   ```

3. Open `http://127.0.0.1:8787` in your browser.
4. Access the administrative Enquiry Desk at `http://127.0.0.1:8787/admin`.
   - **Access Key:** `oGdQoJ7iEDM8bwIrJT0zl0NcWm7DCjtg` (also printed to the terminal on server startup).
   - Alternatively, supply a custom key via the `ADMIN_KEY` environment variable.

### Running Tests

Run the unit and integration test suite:
```bash
npm test
```

Run the end-to-end HTTP smoke test:
```bash
node scripts/smoke-http.mjs
```

### Production Build

Bundle static assets and handler logic into a single worker file:
```bash
npm run build
```

The output bundle is generated at `prototype/dist/server/index.js`.

## Technical Summary

- **Frontend:** Responsive vanilla JavaScript and modern CSS without external dependencies.
- **Backend:** Web-standard HTTP handler compatible with local Node.js and Cloudflare Workers (D1).
- **Storage:** SQLite with WAL mode locally; D1 SQL support in serverless environments.
- **Security:** Parameterized queries, same-origin validation, Content Security Policy, rate limiting, and optimistic concurrency locking.

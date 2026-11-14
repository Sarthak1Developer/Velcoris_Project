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

### Production Build & Deployment

#### Cloudflare Workers
Bundle static assets and handler logic into a single worker file:
```bash
npm run build
```
The output bundle is generated at `prototype/dist/server/index.js`.

#### Vercel
The project is configured for deployment on Vercel:
1. Push this repository to GitHub/GitLab and import it in your **Vercel Dashboard**.
2. **Framework Preset:** Select *Other* (or standard Node.js).
3. **Environment Variables (Optional):**
   - `ADMIN_KEY`: Set your custom admin access key (defaults to `oGdQoJ7iEDM8bwIrJT0zl0NcWm7DCjtg`).
   - `TURSO_DATABASE_URL`: *(Recommended for production)* URL of your Turso SQLite database (e.g., `libsql://your-db-org.turso.io`).
   - `TURSO_AUTH_TOKEN`: Your Turso auth token.
   *(Note: If Turso credentials are omitted, Vercel will run using an ephemeral local SQLite database in `/tmp/enquiries.sqlite` for instant preview/testing).*

## Technical Summary

- **Frontend:** Responsive vanilla JavaScript and modern CSS without external dependencies.
- **Backend:** Web-standard HTTP handler compatible with local Node.js and Cloudflare Workers (D1).
- **Storage:** SQLite with WAL mode locally; D1 SQL support in serverless environments.
- **Security:** Parameterized queries, same-origin validation, Content Security Policy, rate limiting, and optimistic concurrency locking.

# Personal OS — Agent Guidelines

## Project Overview

Personal dashboard web app for daily life management: ideas, clothes tracking, finance, learning, packages, and file indexing. Single-page app with sidebar navigation, Supabase backend, and realtime sync.

## Tech Stack — HARD RULES

- **Vanilla HTML5 / CSS3 / JS (ES6+) ONLY** — no React, no Vue, no jQuery, no build tools, no bundler
- **Supabase via CDN** — UMD bundle (`@supabase/supabase-js@2`), loaded in `index.html`
- **LaTeX via KaTeX** (CDN), **diagrams via SVG** — no image dependencies
- **Zero production dependencies** — `package.json` has only ESLint + Prettier as devDependencies
- **No npm build step** — open `index.html` directly or serve with any static server

## File Structure

```
personal-os/
├── index.html              # Single page — all HTML, sidebar, modals
├── css/style.css           # Single stylesheet (dark theme)
├── js/
│   ├── supabase-client.js  # Connection config + generic CRUD helpers (db object)
│   ├── utils.js            # Shared utilities (escapeHtml, formatDate, formatCurrency, showToast, etc.)
│   ├── app.js              # Main app logic: routing, table loading, modal, realtime subscription
│   └── tables/
│       ├── ideas-brainstorm.js    # Each table is a self-contained module
│       ├── clothes-tracker.js
│       ├── learning-reminders.js
│       ├── package-tracker.js
│       ├── local-files-index.js
│       ├── finance-tracker.js
│       └── to-learn.js
├── .eslintrc.json
├── .prettierrc
└── package.json
```

## Table Module Pattern

Every table module in `js/tables/` follows this structure:

```js
const TableName = {
    name: 'supabase_table_name',    // must match Supabase table name exactly
    displayName: 'Human Readable',
    icon: '🎯',

    columns: [
        { key: 'field_name', label: 'Label', type: 'text|textarea|select|number|date', required: true, options: [...] },
        // ...
    ],

    renderRow(item) {
        // Returns <tr> HTML string
        // MUST produce exactly columns.length + 1 <td> cells (data columns + Actions)
        // Use escapeHtml() for all user data, formatDate() for dates, formatCurrency() for money
    },
};
```

CRITICAL: The `columns` array drives BOTH the table headers AND the modal form. The `renderRow` function generates `<td>` cells independently. Cell count from `renderRow` MUST equal `columns.length + 1`, or columns go out of alignment.

## Adding a New Table — Checklist

1. Create SQL in Supabase SQL Editor (REST API cannot run DDL)
2. Add GRANT + RLS policy for anon role
3. Create `js/tables/<table-name>.js` with the module pattern above
4. Register in `js/app.js` → `TABLES` object
5. Add sidebar link in `index.html`
6. Add globals to `.eslintrc.json` if needed
7. Add dashboard stat card in `index.html` + `loadDashboardStats()` in `app.js`

## Language & Formatting

- **Code**: English (variables, functions, comments)
- **UI text**: Bahasa Indonesia (labels, placeholders, toast messages)
- **Date format**: `toLocaleDateString('id-ID')` — e.g. "14 Jun 2026"
- **Currency**: `formatCurrency()` — format `Rp100.000` (no space, dot separator, no decimals)
- **HTML lang**: `lang="id"`

## Code Style

- **Prettier**: 4-space indent, single quotes, trailing commas, 100 char print width, semicolons
- **ESLint**: `eslint:recommended` + `prettier`, browser env, ES2021
- Run `npm run lint` and `npm run format` before committing
- All user-rendered data MUST pass through `escapeHtml()` — XSS prevention
- Use `formatDate()`, `formatDateTime()`, `formatCurrency()` from utils.js — never inline formatting

## Global Variables (shared across files)

The app uses script-level globals (no module bundler). Key ones:

- `sb` — Supabase client instance (not `supabase` which is the CDN library)
- `db` — Generic CRUD helpers: `db.getAll()`, `db.insert()`, `db.update()`, `db.remove()`, `db.query()`, `db.getCount()`
- `TABLES` — Registry mapping table names to module objects
- `currentTable`, `editingId`, `tableData` — App state
- Utility functions: `escapeHtml`, `formatDate`, `formatCurrency`, `showToast`, `withRetry`, `navigateTo`, `openModal`, `closeModal`, `editRow`, `deleteRow`, `loadTableData`

## Supabase Patterns

- **Read**: `db.getAll(table, orderBy, ascending)` — defaults to `created_at` desc
- **Ascending sort**: For tables like `to_learn` that need ascending order, pass `ascending=true` as 3rd arg
- **Count**: `db.getCount(table)` — uses `{ count: 'exact', head: true }`
- **Filter**: `db.query(table, filters, options)` — supports `{ operator: 'gte', value: 5 }` syntax
- **Realtime**: One global channel `public-schema-changes` listening to all `postgres_changes` events
- **Dashboard stats**: Use `Promise.allSettled` (not `Promise.all`) — one table error shouldn't break everything

## Pitfalls (HARD-WON LESSONS)

1. **markReviewed guard**: Always check `last_reviewed === today` before processing — prevents exponential interval doubling from spam-clicks (1→2→4→8→16→30 in seconds)
2. **Supabase REST cannot run DDL**: CREATE/ALTER/DROP TABLE, GRANT, CREATE POLICY — none work via PostgREST. Use Supabase SQL Editor dashboard only.
3. **Bulk insert key mismatch**: All objects in an array insert MUST have exactly the same keys. Missing keys cause `PGRST102`. Fix: add `null` for missing fields.
4. **Columns array alignment**: `columns.length + 1` (for Actions) must match the number of `<td>` cells in `renderRow()`. Embed metadata inside existing cells rather than adding extra columns.
5. **Supabase key format**: Use `sb_publishable_` / `sb_secret_` format (migrated June 2025). Old JWT keys are deprecated.
6. **RLS policies**: Current setup uses `FOR ALL USING (true) WITH CHECK (true)` — anon key can INSERT/UPDATE/DELETE on all tables.

## Dependencies & Tools

- **Lint**: `npm run lint` (ESLint 8.x)
- **Format**: `npm run format` (Prettier 3.x)
- **No test framework** — no automated tests currently
- **No build step** — just open index.html or `npx serve .`

## Related Hermes Skills

- `personal-os-schema` — Full Supabase schema, automation setup, curl patterns
- `supabase-crud-dashboard` — Generic Supabase + vanilla JS dashboard pattern
- `table-stats-bar` — Per-table stats bar pattern (renderStats hook)
- `binderbyte-package-tracking` — Package tracker API integration

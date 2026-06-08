# Clio , Product Search

A Next.js app for searching and filtering a product catalogue. All search and filter logic runs on the server via
`/api/products`; the frontend only calls that API and never touches the raw CSV.

## Running locally

You'll need Node.js 20+ and [pnpm](https://pnpm.io/) (the project pins `pnpm@10.11.0`).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The home page is the product search UI.

Other useful commands:

```bash
pnpm build   # production build
pnpm start   # run the production server
pnpm lint    # ESLint
```

The CSV lives at `src/services/csv.csv`. `next.config.ts` includes it in the serverless bundle for `/api/products` so
the file is available in production deployments.

---

## How it's structured

I tried to keep a clear line between "read data", "search data", "expose an API", and "render UI". Nothing fancy , just
layers that are easy to follow.

```
CSV file
  → product.repository.ts     (parse + cache)
  → product-search.service.ts (validate, filter, paginate)
  → /api/products/route.ts    (HTTP layer)
  → product.service.ts        (client fetch)
  → React Query + UI components
```

### Data layer

The CSV is parsed **server-side on the first request**, then held in a module-level in-memory cache. I went with lazy
loading rather than build-time parsing because the dataset is large and I didn't want to slow down every build for data
that only the API route needs.

Parsing uses `csv-parse` with typed columns. Raw rows are typed as `TProduct`; JSON-heavy fields (price range, images,
variants, etc.) are cast into proper structures so you end up with `TProductParsed` , actual objects you can query, not
opaque strings.

I considered importing the CSV as a static JSON file at build time. That would make cold starts faster, but the
trade-off is a much heavier build artifact and redeploying whenever the file changes. For a take-home with a single
static file, in-memory caching after first parse felt like the right balance.

### API contract

`GET /api/products` accepts:

| Param          | Type                                  | Default | Notes                                       |
| -------------- | ------------------------------------- | ------- | ------------------------------------------- |
| `q`            | string                                | `""`    | Search across title, description, vendor    |
| `vendor`       | string                                | `""`    | Partial, case-insensitive match             |
| `minPrice`     | number                                | ,       | Uses `PRICE_RANGE.min_variant_price.amount` |
| `maxPrice`     | number                                | ,       | Same                                        |
| `availability` | `all` \| `in_stock` \| `out_of_stock` | `all`   | Based on `HAS_OUT_OF_STOCK_VARIANTS`        |
| `pageNumber`   | number                                | `1`     | 1-based                                     |
| `pageSize`     | number                                | `10`    | Max 100                                     |

Response shape:

```json
{
  "data": [
    /* TProductParsed[] */
  ],
  "pagination": {
    "rowCount": 42,
    "pageCount": 5,
    "pageIndex": 1
  },
  "status": 200,
  "message": "Success"
}
```

Validation errors return `400` with a message (bad page numbers, inverted price range, etc.). Unexpected failures return
`500`. I kept the envelope consistent so a mobile client or alternate frontend could consume the same contract without
guessing.

### Search logic

Search is **case-insensitive substring matching** on title, description, and vendor. An empty `q` returns everything
(still subject to other filters).

I skipped fuzzy matching (Levenshtein, trigrams, etc.). The assignment asked for partial matches, and `includes()`
covers that without extra dependencies or tuning. Fuzzy search is great for typo tolerance, but it also returns false
positives and needs scoring/threshold decisions that felt out of scope for a CSV this size. Happy to defend that call in
a review.

Filters are applied in sequence: text search → vendor → price range → availability. All of this lives in
`src/utils/product-search.utils.ts`, called from the search service , not in the route handler, not on the client.

### Frontend

The UI is a search input, filter controls (vendor, min/max price, availability), a results table, and page-based
pagination.

- **Filter state** lives in a React context (`ProductContextProvider`). Components call `patchFilters` to update one
  field at a time and reset page to 1 when filters change.
- **Data fetching** uses TanStack Query. The query key is the full filter object, so each distinct search gets its own
  cache entry.
- **Debounced search** , the text input waits 300ms before firing a request, so typing doesn't hammer the API.
- **Separation** , `ProductSearch` handles inputs, `ProductTable` / `ProductTableBody` handle results, `Pagination` is
  shared. No god component.

The table only shows a few columns (ID, title, vendor, description). The CSV has dozens of fields; surfacing all of them
would clutter the UI without adding much to the search demo.

### Loading and error states

These aren't afterthoughts , they're part of the feature:

- **Loading** , skeleton rows in the table while a request is in flight.
- **API errors** , an inline alert with the server message and a retry button (React Query `refetch`).
- **No results** , different copy depending on whether filters are active vs. an genuinely empty catalogue.
- **Empty query** , treated as "show all" (with pagination), not an error.

---

## What I left out (on purpose)

**URL state** , Filters live in React state, not the browser URL. Syncing query params with `useSearchParams` (or
something like `nuqs`) would make searches shareable and back-button-friendly. I prioritized getting the server search
path right first. With another hour or two, URL sync would be my first nice-to-have.

**API tests** , No test suite yet. The search utils are pure functions and the route handler is thin, so they'd be
straightforward to cover with a few `vitest` cases. Ran out of time before writing them.

**Fuzzy search** , Covered above. Substring matching matches the spec; fuzzy would be the next step if users complained
about typos.

**Full product detail view** , Search and list only. Didn't build a `/products/[id]` page.

**Database / search engine** , The assignment said no external DB. A real production system with this catalogue size
would not keep filtering in a loop over an in-memory array.

---

## Caching , when and where

**Server (implemented):** After the first parse, products stay in a module-level variable for the lifetime of the
process. Subsequent requests skip disk I/O and re-parsing. This works well for a single Node process; in a serverless
environment with many cold instances, each instance pays the parse cost once.

**Client (implemented):** React Query caches responses by filter params. Going back to a previous page or re-opening the
same search is instant.

**What I'd add with more time:**

- **HTTP caching** , `Cache-Control` on the API for identical query strings, maybe short TTL with
  `stale-while-revalidate`.
- **Build-time index** , Precompute a lightweight search index (e.g. SQLite with FTS, or even a flat JSON + inverted
  index) and ship it with the deploy. Parse once, not per instance.
- **CDN edge caching** , For mostly-read catalogues, cache popular queries at the edge. Less useful when every search
  string is unique.

---

## What breaks at 500k products?

The provided CSV is already in that ballpark (~870k rows), so this isn't hypothetical.

The current approach , load everything into memory, `Array.filter` on every request, then `slice` for pagination , has
real limits:

1. **Memory** , Hundreds of thousands of parsed objects with nested JSON fields add up. One process might handle it;
   many serverless instances each holding a full copy does not scale well.
2. **CPU per request** , Every search scans the entire catalogue. A broad query like an empty `q` touches every row.
   Latency grows linearly with catalogue size.
3. **Cold starts** , First request on a fresh instance reads and parses a very large CSV. That can mean multi-second
   delays before caching kicks in.
4. **Pagination doesn't help search cost** , We only return 10–100 rows, but we still filter the full set to know
   `rowCount` and which slice to return.

At 500k+, I'd move search to something built for it: PostgreSQL with `tsvector`, SQLite FTS, Elasticsearch/OpenSearch,
or even a pre-built inverted index at build time. The API contract could stay the same; only the data layer behind
`searchProducts` would change. I'd also return a trimmed DTO from the API (not the full `TProductParsed` with every
metafield) to shrink payloads.

---

## One thing I'd do differently

If I had more time, I'd **add URL state for filters** and **write a small search index at build time** instead of
parsing the full CSV on first request.

URL state is the highest-impact UX win for relatively low effort , it makes the feature feel finished and costs almost
nothing architecturally since the API already speaks query strings.

The build-time index is the highest-impact performance win. The CSV is static; there's no reason every server instance
should parse half a million rows independently. A generated SQLite file or JSON index committed (or produced in CI)
would cut cold-start time dramatically and make the "500k products" story much more convincing without reaching for
external infrastructure.

---

## Tech stack

- **Next.js 16** (App Router)
- **TypeScript** throughout
- **Tailwind CSS** + shadcn/ui for components
- **TanStack Query** for client data fetching
- **csv-parse** for server-side CSV parsing
- **use-debounce** for search input

---

## Building it rock solid

The current app covers the assignment: server-side search, pagination, loading/error/empty states, debounced input. The
notes below are what I'd tackle next to make this production-grade , things I noticed while building but deliberately
scoped out of the first pass.

### Better column visibility

Right now the table hard-codes four columns (ID, title, vendor, description) in `PRODUCT_COLUMNS`. That keeps the demo
readable, but a real catalogue UI needs column show/hide, reorder, and maybe persisted preferences (localStorage or user
settings). TanStack Table pairs well with this , see below , but even without it, a column picker and rendering
formatted values (price, stock badge, thumbnail) instead of raw `String(product[column])` would make the grid far more
useful.

### Richer API response handling

Today the API returns `200`, `400` (validation), or `500` (generic server error). The client surfaces the message and
offers retry. That's enough for a take-home, but a real API has a wider vocabulary: `401`/`403` for auth, `404` for
missing resources, `429` for rate limits, `503` for overload. I'd define a typed error envelope (code, message, optional
details) and map each status to specific UI on the frontend , not one generic alert for everything. React Query's
`retry` logic should also be status-aware: retry on `500`/`503`, don't retry on `400`/`401`/`429`.

### Mobile responsiveness

Filter controls use a responsive grid (`sm:grid-cols-2`, `lg:grid-cols-4`), but the results table is a plain `<table>`
with no horizontal-scroll wrapper or card fallback on small screens. On mobile, wide tables break layout or force
awkward zooming. I'd add a scroll container with sticky first column, collapse filters into a sheet/drawer, and consider
a card list view below a breakpoint instead of squeezing every column into the viewport.

### Zod validation for request params

Validation lives in a hand-written `validateSearchParams` function. It works, but Zod would give parse + validate in one
step at the API boundary: coerce `pageNumber` from string, reject garbage `availability` values, cap string lengths on
`q` and `vendor`, and produce typed output or a structured `ZodError` for `400` responses. The schema becomes the single
source of truth for what `/api/products` accepts , same schema could be shared with the client for form validation if
needed.

### Layered architecture (infra / domain / application)

The codebase is layered but flat , `services`, `utils`, and `types` sit side by side. For something maintainable at
scale, I'd split more aggressively:

- **Infrastructure** , data sources (CSV reader, future DB client), repositories (raw reads/writes), caching adapters,
  third-party SDKs. No business rules here; just "get data in and out."
- **Domain** , entities (`Product`), search/filter rules, price/availability logic, pagination math. Pure functions, no
  HTTP, no filesystem.
- **Application** , use cases that wire infra to domain (`SearchProductsUseCase`). The API route becomes a thin HTTP
  adapter that parses the request, calls the use case, maps the result to JSON.

That makes swapping CSV for SQLite a one-folder change and keeps business logic testable without mocking Next.js.

### Proper logging

The only logging today is `console.error` in the catch block of the route handler. For production I'd use structured
logging (e.g. `pino`) with request IDs, log levels, and context: query params (sanitized), duration, result count, cache
hit/miss. Errors would include stack traces server-side but never leak internals to the client. Logs feed into whatever
observability stack you run , Datadog, CloudWatch, etc.

### Middlewares

Next.js middleware is the right place for cross-cutting concerns that shouldn't live in every route handler: request ID
injection, auth token checks, rate-limit headers, CORS preflight, logging the incoming request before it hits the
handler. Keeps `/api/products/route.ts` focused on parsing params and returning JSON.

### Rate limiting

Nothing stops a client from firing hundreds of search requests per second , especially relevant with a debounced input
still hitting the server on every settled query. I'd add per-IP or per-token limits in middleware (or at the edge via
Vercel/KV/Upstash), return `429` with `Retry-After`, and teach the frontend to show a specific "slow down" state instead
of a generic error.

### CORS restrictions

The API is same-origin today, which is fine for this Next.js app. If a separate frontend or mobile app consumed
`/api/products`, open CORS would be a risk. I'd restrict `Access-Control-Allow-Origin` to known origins in middleware,
allow only `GET` for this endpoint, and document the policy. Same-origin apps don't need it; external consumers do.

### Reset filters

**Done in v1.** The search UI has a Reset button that restores `DEFAULT_PRODUCT_SEARCH_PARAMS` , clears query, vendor,
price range, availability, and page. One gap: the search input is uncontrolled (debounced `onChange` only), so after
reset the visible text in the box may not clear until you wire it to filter state or remount the input. Small polish
item, not missing functionality.

### More aggressive linting

ESLint with `eslint-config-next` is the baseline. I'd tighten it: `@typescript-eslint/strict-type-checked`,
`eslint-plugin-import` for ordered/unused imports, `eslint-plugin-unicorn` or similar for consistency, `no-console` in
production paths (use the logger instead), and Prettier already runs on commit via lint-staged. The goal isn't more red
squiggles for the sake of it , it's catching `any` leaks, dead code, and inconsistent patterns before review.

### TanStack Table for the results grid

The table is hand-rolled: map columns, map rows, manual skeleton and empty states.
[@tanstack/react-table](https://tanstack.com/table) would give sorting, column visibility, column resizing, row
selection, and virtualisation for large page sizes , all declarative. It composes cleanly with the existing TanStack
Query setup (Query fetches, Table renders). Most of the win is column visibility and sort without bolting on one-off
state for each feature.

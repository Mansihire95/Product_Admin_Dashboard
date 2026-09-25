# Product Admin Dashboard

A production-quality React admin dashboard for managing products using the [DummyJSON](https://dummyjson.com) API.

## Tech Stack

| Tech | Purpose |
|------|---------|
| React 18 | UI library |
| Vite | Build tool / dev server |
| Axios | All HTTP requests |
| React Router v6 | Client-side routing & URL state |
| CSS (custom) | All styling — no framework |
| DummyJSON API | Backend |

## Features


- ✅ Protected routes — redirect to `/login` if not authenticated
- ✅ Logout with auth cleanup
- ✅ Product list with table (desktop) and cards (mobile)
- ✅ Pagination — manual implementation with `limit` / `skip`
- ✅ Page sizes: 10, 20, 50 — configurable via dropdown
- ✅ "Showing X–Y of Z" pagination info
- ✅ Search with 400ms debounce — manual timer, no library
- ✅ Stale request prevention via AbortController
- ✅ Category filter dropdown (fetched from API)
- ✅ Sorting by price, rating, title (asc/desc)
- ✅ All filter/sort/pagination state in URL (survives refresh)
- ✅ Product details page with image gallery + reviews
- ✅ Add product with validation
- ✅ Edit product with pre-filled form
- ✅ Delete product with confirmation modal
- ✅ CRUD changes visible via React context + localStorage
- ✅ Loading states on every async operation
- ✅ Empty state when no results
- ✅ Error states with Retry button
- ✅ Cancelled requests silently ignored
- ✅ Invalid URL params normalized to safe defaults
- ✅ 404 Not Found page
- ✅ Responsive layout (mobile-first)
- ✅ No TypeScript, no Redux, no table/pagination libraries

## Setup

```bash
# Clone or download the project
cd product-admin-dashboard

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Login Credentials

```
Username: emilys
Password: emilyspass
```

## API

Base URL: `https://dummyjson.com`

Key endpoints used:
- `POST /auth/login`
- `GET /products`
- `GET /products/search?q=`
- `GET /products/categories`
- `GET /products/category/{category}`
- `GET /products/:id`
- `POST /products/add`
- `PUT /products/:id`
- `DELETE /products/:id`

---

## Important Design Decisions

### 1. Why Axios Instance + Interceptors?

A single shared Axios instance (`src/api/axios.js`) is created with the base URL.

- **Request interceptor**: Automatically reads the token from localStorage and attaches `Authorization: Bearer <token>` to every outgoing request. No need to manually add headers in each API call.
- **Response interceptor**: Centralizes all error handling. On 401, it clears stored auth data and redirects to `/login`. For other errors, it converts raw Axios error objects into readable strings so the UI only deals with plain messages.

### 2. How Authentication Token Is Stored and Attached

On successful login, the `accessToken` and user info (name, email, avatar) are stored in `localStorage` via `src/utils/auth.js`. The Axios request interceptor reads `localStorage` on every request and attaches the token automatically.

### 3. How Protected Routes Work

`src/components/ProtectedRoute.jsx` is a simple wrapper component. It calls `isAuthenticated()` which checks for the presence of a token in localStorage. If the token is absent, it renders `<Navigate to="/login" replace />`. If present, it renders `{children}`.

### 4. How Pagination Works

The API supports `limit` (page size) and `skip` (offset) parameters. Given `page` and `pageSize`:

```
skip = (page - 1) * pageSize
```

The API returns a `total` count. The pagination component computes `totalPages = ceil(total / pageSize)` and renders page number buttons with ellipsis. "Showing X–Y of Z" is derived from `start = (page-1)*pageSize+1`, `end = min(page*pageSize, total)`.

### 5. How URL State Works

All filter, sort, and pagination values (`page`, `pageSize`, `search`, `category`, `sort`) are stored in URL query parameters using React Router's `useSearchParams`. Every user interaction (search, filter change, sort change, page change) calls `setSearchParams(...)` which updates the URL. On mount, the component reads from the URL, so refreshing or sharing the URL produces the same state.

### 6. How Debounce Works

The search input is a controlled component that updates local state immediately (so the input feels responsive). A `useRef`-based timer (`debounceRef`) is used:

```js
clearTimeout(debounceRef.current);
debounceRef.current = setTimeout(() => {
  updateURL({ search: value, page: 1 });
}, 400);
```

Only after 400ms of inactivity does the URL update, which triggers the API call. This is a fully manual debounce — no external library.

### 7. How Stale Search Requests Are Prevented

**Problem**: If the user types "phone", then quickly types "iphone", two API requests are in-flight. If "phone"'s response arrives after "iphone"'s, it would incorrectly overwrite the results.

**Solution**: Each new fetch creates a new `AbortController` and aborts the previous one:

```js
if (abortControllerRef.current) {
  abortControllerRef.current.abort(); // cancel previous request
}
const controller = new AbortController();
abortControllerRef.current = controller;

// Pass signal to Axios
await searchProducts({ q, signal: controller.signal });
```

Axios throws a `CancelledError` for aborted requests. The error handler checks `axios.isCancel(err)` — if true, the error is silently ignored and no error message is shown.

### 8. How Search + Category Limitation Is Handled

DummyJSON does not support simultaneous search and category filtering in a single API endpoint.

**Strategy implemented**:

| State | Endpoint Used |
|-------|--------------|
| No search, no category | `GET /products` |
| Category only | `GET /products/category/{cat}` |
| Search only | `GET /products/search?q=` |
| Search + Category | `GET /products/search?q=` → client-side filter by category |

When both are active, we fetch all search results (with `limit=0` to get everything from DummyJSON, though DummyJSON caps at its default) and then filter client-side by `product.category === selectedCategory`. Pagination is then applied manually on the filtered results. This gives predictable, consistent results and is clearly documented in comments.

### 9. Why Add/Edit/Delete Are Not Permanently Persisted

DummyJSON is a mock API. It returns success responses for POST/PUT/DELETE but does not actually store any changes — a page refresh would revert to original API data.

**Solution**: A `ProductContext` (`src/context/ProductContext.jsx`) maintains three override lists in React state, persisted to localStorage:
- `addedProducts`: new products are prepended to the list
- `editedProducts`: map of `{id: updatedProduct}` — patches any product fetched from the API
- `deletedIds`: IDs of deleted products — filtered out of API results

On every render, `applyOverrides(apiProducts)` applies these overrides on top of what the API returns.

### 10. How Invalid URL Values Are Handled

`src/utils/urlParams.js` has a `parsePageParams()` function that safely parses all URL params:

- `page=abc` → `NaN` → normalized to `1`
- `page=-5` → `-5 < 1` → normalized to `1`
- `pageSize=banana` → `NaN` → not in `[10, 20, 50]` → normalized to `10`
- `pageSize=1000` → not in `[10, 20, 50]` → normalized to `10`
- `page=999` with only 194 products and pageSize=10 → `clampPage()` corrects to `20` (last page)

The URL is then updated with the corrected value so it stays consistent.

---

## Problem Faced

**Problem**: When a user types quickly, multiple search requests are fired. An older request (e.g., for "phone") can finish after a newer one (e.g., "iphone"), causing the UI to show wrong results.

**Solution**: Used `AbortController`. Each new search aborts the previous request's controller. Axios passes the `signal` to the underlying `fetch`. When aborted, Axios throws `CanceledError`. The catch block checks `axios.isCancel(err)` and returns early without setting an error state, so the UI stays clean.

---

## AI Usage

AI was used to help structure the initial project layout, identify edge cases in URL parameter handling, and suggest the AbortController pattern for stale request prevention. All code was reviewed, tested, and understood before inclusion. The architecture decisions, component breakdown, and API strategy were guided by the requirements and manually verified.

---

## Known Limitations

1. DummyJSON caps search results — when filtering search results by category client-side, the total count shown may not be perfectly accurate (depends on DummyJSON's pagination of search results).
2. CRUD changes persist in localStorage but reset if localStorage is cleared.
3. DummyJSON may throttle requests; no retry logic beyond the manual Retry button.
4. No dark mode (but CSS variables make it easy to add later).

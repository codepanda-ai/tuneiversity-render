# CLAUDE.md - Tuneiversity (Mandarin Pronunciation Tutor)

## Project Overview

AI-powered Mandarin pronunciation tutor that helps users practice Chinese pronunciation through song lyrics. Users record themselves reading lyrics line-by-line and receive clarity/tone feedback. Currently a UI prototype with mock scoring — no backend or real audio analysis yet.

## Tech Stack

- **Frontend Framework:** Next.js 16 (App Router, Turbopack) + TypeScript (strict mode) for frontend UI
- **Backend Framework:** FastAPI + Python for backend REST services
- **AI:** Google Gemini API for generative AI tasks
- **Data:** Supabase PostgresSQL for persistent storage
- **Deployment:** Vercel
- **Styling:** Tailwind CSS 3 (class-based dark mode, CSS variables)
- **UI Components:** Shadcn/ui (Radix UI primitives) in `components/ui/`
- **Icons:** Lucide React
- **Fonts:** Inter (sans), Noto Sans SC (Chinese characters)
- **Package Manager:** pnpm

## Commands

- `pnpm dev` — Start dev server (Turbopack, port 3000)
- `pnpm build` — Production build
- `pnpm start` — Start production server
- `pnpm lint` — Run ESLint

## Project Structure

```
app/
  layout.tsx          # Root layout (fonts, metadata)
  page.tsx            # Main practice page (core app logic)
  globals.css         # Global styles, CSS variables
components/
  ui/                 # Shadcn/ui primitives (~52 components)
  audio-controls.tsx  # Recording & playback with waveform animation
  lyrics-display.tsx  # Character/pinyin display with tone colors
  practice-header.tsx # Song info, progress bar, video
  feedback-section.tsx# Clarity score display
  verse-mode.tsx      # Full verse practice mode
  song-report.tsx     # Performance report with recommendations
hooks/                # Custom hooks (use-toast, use-mobile)
lib/utils.ts          # cn() utility (clsx + twMerge)
```

## Code Conventions

- Use consistent naming conventions
- Follow existing patterns before creating new ones
- Check for linter errors before committing
- All interactive components use `"use client"` directive
- Named exports (not default exports)
- Props interfaces suffixed with `Props`
- Tailwind-only styling; use `cn()` for conditional class merging
- Path alias: `@/*` maps to project root
- State management via React hooks only (useState, useCallback) — no global state library
- Mobile-first responsive design (`max-w-lg`, `md:` breakpoints)

## Tone Color System

Pinyin characters map to tones via regex detection:
- Tone 1 (ā ē ī ō ū ǖ) → `text-primary` (teal)
- Tone 2 (á é í ó ú ǘ) → `text-chart-5` (orange)
- Tone 3 (ǎ ě ǐ ǒ ǔ ǚ) → `text-chart-3` (gray)
- Tone 4 (à è ì ò ù ǜ) → `text-destructive` (red)

## Notes

- TypeScript build errors are currently ignored in `next.config.mjs` (`ignoreBuildErrors: true`)
- Song data is hardcoded in `page.tsx` (小幸运 by Hebe Tien)
- Audio recording, AI analysis, database, and auth are not yet implemented — all feedback is mock data
- No test framework is configured

---
# next-js Best Practices

This document outlines the definitive best practices for developing Next.js applications. Adhering to these guidelines ensures consistent, performant, and maintainable code, leveraging Next.js's strengths for modern web development.

## 1. Code Organization and Structure

Always use the `app/` directory for new projects. Organize code by feature, not by type, to improve discoverability and cohesion.

### ✅ GOOD: Feature-Driven `app/` Directory

Group all related files for a feature (components, pages, layouts, hooks, types) within a single directory.

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() { /* ... */ }

// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) { /* ... */ }

// app/dashboard/components/DashboardOverview.tsx
export function DashboardOverview() { /* ... */ }

// app/dashboard/hooks/useDashboardData.ts
export function useDashboardData() { /* ... */ }
```

### ❌ BAD: Type-Driven `app/` Directory

Avoid scattering files of the same feature across different top-level type directories.

```tsx
// app/dashboard/page.tsx
// components/dashboard/DashboardOverview.tsx // Separated
// hooks/useDashboardData.ts // Separated
```

### Core Directories

*   **`app/`**: All route-related files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`).
*   **`components/`**: Reusable UI components that are *not* directly tied to a specific route.
*   **`lib/`**: Backend-agnostic utility functions, data access layers, and third-party integrations.
*   **`hooks/`**: Custom React hooks for reusable logic.
*   **`types/`**: Global TypeScript type definitions and interfaces.
*   **`public/`**: Static assets (images, fonts) that are served directly.

## 2. Component Architecture: Server Components First

Prioritize Server Components for all UI rendering. Use Client Components only when interactivity (state, effects, event handlers) is strictly required.

### ✅ GOOD: Server Component by Default

Server Components reduce client-side JavaScript bundles, improve initial page load, and enhance security by keeping sensitive logic on the server.

```tsx
// app/products/[id]/page.tsx (Server Component by default)
import { getProductDetails } from '@/lib/api';

export default async function ProductPage({ params }) {
  const product = await getProductDetails(params.id);
  return (
    <div>
      <h1>{product.name}</h1>
      {/* ... more server-rendered UI */}
      <AddToCartButton productId={product.id} /> {/* Client Component */}
    </div>
  );
}
```

### ✅ GOOD: "use client" Boundary as Low as Possible

Place the `"use client"` directive at the lowest possible point in your component tree. This ensures that only the interactive parts are client-rendered, keeping parent components as Server Components.

```tsx
// components/AddToCartButton.tsx
'use client'; // Only this component and its children are client-side

import { useState } from 'react';

export function AddToCartButton({ productId }) {
  const [quantity, setQuantity] = useState(1);
  // ... interactive logic
  return <button onClick={() => alert(`Added ${quantity} of ${productId}`)}>Add to Cart</button>;
}
```

### ❌ BAD: Overuse of "use client"

Don't mark entire feature folders or layouts as client components if only a small part needs interactivity. This unnecessarily increases client bundle size.

```tsx
// app/products/[id]/page.tsx (BAD: entire page marked client)
'use client'; // This makes the whole page a client component
import { useState, useEffect } from 'react'; // Even if only a small part needs it

export default function ProductPage({ params }) {
  // ...
  return <button>Add to Cart</button>;
}
```

## 3. Data Fetching

Fetch data directly in Server Components using `fetch` or a dedicated data access layer. Use Route Handlers for client-side mutations or when exposing a specific API endpoint.

### ✅ GOOD: Server Component Data Fetching

Directly fetch data in Server Components. `fetch` requests are automatically memoized and cached by Next.js.

```tsx
// app/dashboard/page.tsx
import { getUserProfile, getRecentOrders } from '@/lib/api';

export default async function DashboardPage() {
  // Data fetches in parallel
  const [user, orders] = await Promise.all([
    getUserProfile(),
    getRecentOrders(),
  ]);

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <OrderList orders={orders} />
    </div>
  );
}
```

### ✅ GOOD: Route Handlers for Client-Side Mutations

Use `route.ts` for API endpoints that handle client-side data mutations (e.g., form submissions, API calls from client components).

```tsx
// app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { addToCart } from '@/lib/cart';

export async function POST(request: Request) {
  const { productId, quantity } = await request.json();
  await addToCart(productId, quantity);
  return NextResponse.json({ success: true });
}
```

### ✅ GOOD: Streaming with `loading.tsx` and `Suspense`

Improve perceived performance by showing instant loading states for slow data fetches.

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>;
}

// app/dashboard/page.tsx (assuming some slow component)
import { Suspense } from 'react';
import { SlowComponent } from './components/SlowComponent';

export default async function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading slow data...</div>}>
        <SlowComponent />
      </Suspense>
    </main>
  );
}
```

## 4. Performance Considerations

Leverage Next.js's built-in optimizations for images, fonts, and code splitting.

### ✅ GOOD: `next/image` for Images

Always use `next/image` for local and remote images. It provides automatic optimization, lazy loading, and responsive sizing.

```tsx
import Image from 'next/image';
import profilePic from '@/public/profile.jpg';

export function UserAvatar() {
  return (
    <Image
      src={profilePic}
      alt="User Profile"
      width={100}
      height={100}
      placeholder="blur"
    />
  );
}
```

### ❌ BAD: Native `<img>` Tag

Avoid the native `<img>` tag as it bypasses Next.js's image optimizations.

```tsx
// ❌ BAD
export function UserAvatar() {
  return <img src="/profile.jpg" alt="User Profile" width="100" height="100" />;
}
```

### ✅ GOOD: `next/font` for Fonts

Use `next/font` to optimize font loading, eliminate external network requests, and prevent layout shift.

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### ✅ GOOD: Dynamic Imports for Heavy Components

Lazily load heavy client-side components or third-party libraries using `next/dynamic`.

```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./components/HeavyChart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // Only load on client if not needed for initial render
});

export function DashboardCharts() {
  return (
    <div>
      <HeavyChart />
    </div>
  );
}
```

## 5. State Management

Keep state local where possible. For global state, use React Context for simple cases or lightweight libraries like Zustand/Jotai for more complex needs.

### ✅ GOOD: Local State with `useState`

For component-specific, ephemeral state.

```tsx
'use client';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

### ✅ GOOD: Global State with Context or Zustand/Jotai

For application-wide state that needs to be shared across many components. Prefer Zustand or Jotai over Redux for most Next.js projects due to their simplicity and performance.

```tsx
// lib/store.ts (using Zustand)
import { create } from 'zustand';

interface BearState {
  bears: number;
  increasePopulation: () => void;
}

export const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
}));
```

## 6. Error Handling

Implement robust error handling using Next.js's dedicated error files.

### ✅ GOOD: Route-Level `error.tsx`

Catch errors within a specific route segment, providing localized fallback UI.

```tsx
// app/dashboard/error.tsx
'use client'; // Error boundaries must be client components

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error); // Log the error to an error reporting service
  }, [error]);

  return (
    <div>
      <h2>Something went wrong in the dashboard!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### ✅ GOOD: Global `global-error.tsx`

Catch uncaught errors across your entire application, providing a consistent fallback.

```tsx
// app/global-error.tsx
'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <h2>Something went wrong globally!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

### ✅ GOOD: `not-found.tsx` for 404s

Create a custom 404 page for unmatched routes.

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}
```

## 7. ESLint and Type Checking

Enforce code quality and catch common issues early with ESLint and TypeScript.

### ✅ GOOD: Use `eslint-config-next/core-web-vitals`

This configuration elevates performance-related warnings to errors, ensuring your application meets Core Web Vitals standards. Always combine with `eslint-config-next/typescript` for TypeScript projects.

```javascript
// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript'; // For TypeScript projects

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs, // Include for TypeScript
  {
    rules: {
      // Custom overrides or additional rules here
      '@next/next/no-img-element': 'error', // Enforce next/image
      // ...
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
```

## 8. Common Pitfalls and Anti-patterns

Avoid these common mistakes to maintain a high-quality Next.js application.

### ❌ BAD: Using `<a>` for Internal Navigation

This bypasses Next.js's automatic prefetching and client-side navigation.

```tsx
// ❌ BAD
<a href="/dashboard">Go to Dashboard</a>
```

### ✅ GOOD: Use `<Link>` for Internal Navigation

Enables client-side navigation and prefetching for a smoother user experience.

```tsx
import Link from 'next/link';

// ✅ GOOD
<Link href="/dashboard">Go to Dashboard</Link>
```

### ❌ BAD: Async Client Components

Client Components cannot be `async`. If you need to fetch data on the client, use `useEffect` or a client-side data fetching library.

```tsx
// components/MyClientComponent.tsx
'use client';

// ❌ BAD: Client Components cannot be async
export default async function MyClientComponent() {
  // const data = await fetch('/api/data');
  return <div>Client UI</div>;
}
```

### ✅ GOOD: Client-Side Data Fetching in Client Components

Use `useEffect` or a dedicated client-side library (like SWR or React Query) for data fetching in Client Components.

```tsx
// components/MyClientComponent.tsx
'use client';
import { useState, useEffect } from 'react';

export default function MyClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/data');
      const json = await res.json();
      setData(json);
    }
    fetchData();
  }, []);

  return <div>{data ? `Data: ${data.message}` : 'Loading...'}</div>;
}
```

---
# FastAPI Best Practices

FastAPI is the go-to for high-performance Python APIs. This guide ensures your projects are scalable, secure, and maintainable from day one.

## 1. Code Organization: Domain-Driven Modularity

For any project beyond a few endpoints, organize by domain functionality, not file type. This improves scalability and team collaboration.

❌ BAD: Single `main.py` or `routers/`, `schemas/` directories with all domains mixed.
```python
# app/routers/users.py
# app/routers/items.py
# app/schemas/user.py
# app/schemas/item.py
```

✅ GOOD: Group related components by domain.
```
src/
├── auth/
│   ├── router.py
│   ├── schemas.py
│   ├── service.py # Business logic
│   └── dependencies.py
├── users/
│   ├── router.py
│   ├── schemas.py
│   ├── service.py
│   └── dependencies.py
├── core/
│   ├── config.py # Pydantic BaseSettings
│   └── security.py
├── db/
│   ├── session.py # SQLAlchemy engine/session
│   └── base.py    # Base for models
├── main.py        # Entry point
└── __init__.py
```

## 2. Type Hints: Mandatory Everywhere

Leverage Python's type hints and Pydantic for robust data validation, auto-documentation, and IDE support.

❌ BAD: Missing or inconsistent type hints.
```python
@app.post("/items/")
def create_item(item: dict): # No Pydantic model
    return item
```

✅ GOOD: Explicit Pydantic models and type hints for all function signatures.
```python
from pydantic import BaseModel
from fastapi import FastAPI

class ItemCreate(BaseModel):
    name: str
    description: str | None = None
    price: float

app = FastAPI()

@app.post("/items/", response_model=ItemCreate)
async def create_item(item: ItemCreate) -> ItemCreate:
    # Logic to save item
    return item
```

## 3. Dependency Injection: Decouple Components

Use `fastapi.Depends` for managing database sessions, authentication, and other shared resources. This makes code testable and modular.

❌ BAD: Global database session or direct instantiation.
```python
# In router.py
from app.db.session import SessionLocal
db = SessionLocal() # Global or directly called
```

✅ GOOD: Inject dependencies using `Depends`.
```python
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
# Assume get_session and User are defined elsewhere
# from app.db.session import get_session
# from app.models.user import User

async def get_current_user(token: str) -> 'User': # 'User' for forward reference
    # ... auth logic
    return 'User'(id=1, username="test") # Placeholder

@app.get("/me/")
async def read_current_user(
    db: Annotated[AsyncSession, Depends(lambda: None)], # Placeholder for get_session
    current_user: Annotated['User', Depends(get_current_user)]
):
    return current_user
```

## 4. API Design: Versioning & Thin Endpoints

Version your API from day one. Keep router endpoints focused, delegating business logic to service layers.

❌ BAD: Unversioned API, fat endpoints with business logic.
```python
# app/main.py
@app.get("/users/{user_id}")
def get_user_details(user_id: int, db: 'Session'): # Placeholder
    user = None # db.query(User).filter(User.id == user_id).first()
    # Complex business logic here
    return user
```

✅ GOOD: Use `APIRouter` with prefixes and tags. Delegate logic to `service.py`.
```python
# src/users/router.py
from fastapi import APIRouter, Depends
# Assume get_session, User, UserOut, service are defined elsewhere
# from src.users import service, schemas
# from app.db.session import get_session

router = APIRouter(prefix="/v1/users", tags=["Users"])

@router.get("/{user_id}", response_model=None) # Placeholder for schemas.UserOut
async def read_user(user_id: int, db: 'AsyncSession' = Depends(lambda: None)): # Placeholder
    user = None # await service.get_user_by_id(db, user_id)
    return user

# src/users/service.py
async def get_user_by_id(db: 'AsyncSession', user_id: int) -> 'User': # Placeholder
    # Database query logic
    return None # await db.get(User, user_id)
```

## 5. Error Handling: Use `HTTPException`

Raise `HTTPException` for API-specific errors. Implement custom handlers for global error types.

❌ BAD: Raising generic Python exceptions.
```python
items_db = {1: {"name": "item1"}}
@app.get("/items/{item_id}")
async def get_item(item_id: int):
    if item_id not in items_db:
        raise ValueError("Item not found") # Returns 500
    return items_db[item_id]
```

✅ GOOD: Raise `HTTPException` with appropriate status codes.
```python
from fastapi import HTTPException, status

items_db = {1: {"name": "item1"}}
@app.get("/items/{item_id}")
async def get_item_good(item_id: int):
    if item_id not in items_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return items_db[item_id]
```

## 6. Performance: Async-First & Production Deployment

Embrace `async`/`await` for I/O-bound operations. For CPU-bound tasks, use `run_in_threadpool`. Deploy with Gunicorn + Uvicorn.

❌ BAD: Blocking I/O in async endpoints.
```python
# In an async endpoint
import time
@app.get("/blocking")
async def blocking_endpoint():
    time.sleep(1) # Blocks the event loop
    return {"message": "Done blocking work"}
```

✅ GOOD: Use async libraries (e.g., `asyncpg`, `httpx[async]`) or `run_in_threadpool`.
```python
from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool
import time

app = FastAPI()

def cpu_bound_task():
    time.sleep(0.1) # Simulate CPU work
    return "Done CPU work"

@app.get("/cpu-work")
async def handle_cpu_work():
    result = await run_in_threadpool(cpu_bound_task)
    return {"message": result}

# Production deployment:
# gunicorn -k uvicorn.workers.UvicornWorker src.main:app --workers 4 --bind 0.0.0.0:8000
```

## 7. Security: Environment Variables & Auth

Store sensitive configuration in environment variables using `pydantic-settings`. Implement authentication via `Depends`.

❌ BAD: Hardcoded secrets or config.
```python
# app/core/config.py
DATABASE_URL = "postgresql://user:pass@host:port/db" # Bad
```

✅ GOOD: Use `pydantic-settings` for environment-based configuration.
```python
# src/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
```
```python
# .env (local development)
DATABASE_URL="postgresql+asyncpg://user:pass@db:5432/app"
SECRET_KEY="your-super-secret-key"
```
```python
# src/core/security.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_active_user(token: str = Depends(oauth2_scheme)):
    # Validate token and return user
    return {"username": "current_user"} # Placeholder
```

## 8. Logging: Structured & Centralized

Log to `stdout`/`stderr` in a structured format (e.g., JSON). Let your deployment environment handle aggregation.

❌ BAD: Writing logs to local files or unstructured print statements.
```python
print("User accessed /health endpoint")
```

✅ GOOD: Use Python's `logging` module with a structured formatter.
```python
import logging
# from pythonjsonlogger.jsonlogger import JsonFormatter # Install python-json-logger

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "jsonlogger.JsonFormatter", # Use if python-json-logger is installed
            "format": "%(levelname)s %(asctime)s %(name)s %(message)s"
        }
    },
    "handlers": {
        "default": {
            "formatter": "json", # Change to "standard" if jsonlogger not installed
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "uvicorn": {"handlers": ["default"], "level": "INFO", "propagate": False},
        "uvicorn.access": {"handlers": ["default"], "level": "INFO", "propagate": False},
        "app": {"handlers": ["default"], "level": "INFO", "propagate": False},
    },
    "root": {"handlers": ["default"], "level": "INFO"},
}

logger = logging.getLogger("app")

@app.get("/health")
async def health():
    logger.info("Health check called", extra={"endpoint": "/health"})
    return {"status": "ok"}
```

---
# Supabase Best Practices

This guide outlines the definitive best practices for developing with Supabase, ensuring your projects are secure, performant, and maintainable. Adhere to these rules for consistent, high-quality code.

## 1. SQL Style & Code Organization

Consistency is paramount. Follow these rules for all SQL schema, migrations, and functions.

### 1.1 Naming Conventions
- **Identifiers:** Use `snake_case` for all table, column, and function names. Names must begin with a letter and contain only letters, numbers, and underscores.
- **Keywords:** Always use lowercase for SQL keywords (e.g., `select`, `from`, `where`).
- **Table Names:** Prefer plural, `snake_case` names (e.g., `users`, `products`).
- **Column Names:** Prefer singular, `snake_case` names (e.g., `id`, `name`, `created_at`).
- **Foreign Keys:** Use `singular_table_name_id` (e.g., `user_id` for `users` table).
- **Triggers:** Prefix with a numeric order (e.g., `_200_update_timestamp`) as triggers run in lexicographical order.

❌ BAD
```sql
CREATE TABLE UserProfiles (
    UserID INT PRIMARY KEY,
    UserName VARCHAR(255)
);
SELECT UserID FROM UserProfiles;
```

✅ GOOD
```sql
CREATE TABLE user_profiles (
    id bigint generated always as identity primary key,
    user_name text not null,
    user_id bigint references users (id) -- Example FK
);
SELECT id FROM user_profiles;

-- Trigger naming for ordered execution
CREATE TRIGGER _200_update_user_profile_timestamp
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

### 1.2 Formatting & Readability
- **Indentation:** Use consistent indentation for clauses and arguments.
- **Aliases:** Always use explicit `AS` for aliases. Make them meaningful.
- **Boolean Operators:** Place `AND`/`OR` at the beginning of the line for multi-line `WHERE` clauses.
- **Parentheses:** Align closing parentheses with the starting line of the expression.

❌ BAD
```sql
SELECT t.client_id, DATE(t.created_at) day
FROM telemetry t, users u
WHERE t.user_id = u.id AND t.submission_date > '2019-07-01'
GROUP BY 1, 2;
```

✅ GOOD
```sql
SELECT
    t.client_id AS client_identifier,
    DATE(t.created_at) AS created_day
FROM
    telemetry AS t
INNER JOIN
    users AS u ON t.user_id = u.id
WHERE
    t.submission_date > '2019-07-01'
    AND t.sample_id = '10'
GROUP BY
    t.client_id,
    created_day;
```

### 1.3 Common Table Expressions (CTEs)
- **Prefer CTEs:** Use CTEs (`WITH` clauses) for complex queries to improve readability and modularity over nested subqueries.

❌ BAD
```sql
SELECT
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count,
    u.email
FROM
    users AS u;
```

✅ GOOD
```sql
WITH user_order_counts AS (
    SELECT
        user_id,
        COUNT(*) AS order_count
    FROM
        orders
    GROUP BY
        user_id
)
SELECT
    u.email,
    uoc.order_count
FROM
    users AS u
LEFT JOIN
    user_order_counts AS uoc ON u.id = uoc.user_id;
```

## 2. Data Modeling & Schema Design

Design your schema for clarity, integrity, and performance.

### 2.1 Primary Keys
- **Standard PK:** Every table *must* have an `id` column of type `bigint generated always as identity primary key`.

❌ BAD
```sql
CREATE TABLE products (
    product_code text PRIMARY KEY,
    name text
);
```

✅ GOOD
```sql
CREATE TABLE products (
    id bigint generated always as identity primary key,
    product_code text unique not null,
    name text not null
);
```

### 2.2 Foreign Key Indexes
- **Always Index FKs:** PostgreSQL does *not* automatically index foreign keys. Always add an index to every foreign key column to prevent expensive lookups, especially for reverse relations.

❌ BAD
```sql
CREATE TABLE orders (
    id bigint generated always as identity primary key,
    user_id bigint references users (id)
);
-- Missing index on user_id
```

✅ GOOD
```sql
CREATE TABLE orders (
    id bigint generated always as identity primary key,
    user_id bigint references users (id)
);
CREATE INDEX ON orders (user_id);
```

### 2.3 Table Comments
- **Document Tables:** Always add a descriptive comment to each table using `COMMENT ON TABLE`.

❌ BAD
```sql
CREATE TABLE posts (
    id bigint generated always as identity primary key,
    title text
);
```

✅ GOOD
```sql
CREATE TABLE posts (
    id bigint generated always as identity primary key,
    title text not null,
    content text
);
COMMENT ON TABLE posts IS 'Blog posts published by users.';
```

## 3. Security Best Practices

Security is non-negotiable. Implement these measures from day one.

### 3.1 Row-Level Security (RLS)
- **Enable RLS Everywhere:** Enable RLS on *every* table in your database, especially those exposed via API. This is your primary defense.

❌ BAD
```sql
CREATE TABLE sensitive_data (
    id bigint generated always as identity primary key,
    secret text
);
-- RLS NOT ENABLED
```

✅ GOOD
```sql
CREATE TABLE sensitive_data (
    id bigint generated always as identity primary key,
    secret text,
    user_id uuid references auth.users(id)
);
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_own_secrets ON sensitive_data FOR SELECT USING (auth.uid() = user_id);
```

### 3.2 Function Security
- **Default to `SECURITY INVOKER`:** Functions should run with the permissions of the calling user. Use `SECURITY DEFINER` only when absolutely necessary and with extreme caution.
- **Explicit `search_path`:** If using `SECURITY DEFINER`, *always* set `search_path = ''` and use fully-qualified names (e.g., `public.table_name`) to prevent privilege escalation via malicious objects in other schemas.

❌ BAD
```sql
CREATE FUNCTION get_all_users()
RETURNS SETOF users
LANGUAGE plpgsql
SECURITY DEFINER -- Dangerous without search_path
AS $$
BEGIN
    RETURN QUERY SELECT * FROM users;
END;
$$;
```

✅ GOOD
```sql
CREATE FUNCTION get_current_user_profile()
RETURNS SETOF user_profiles
LANGUAGE plpgsql
SECURITY INVOKER -- Default and safer
SET search_path = '' -- Always set, even for INVOKER for clarity
AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.user_profiles WHERE user_id = auth.uid();
END;
$$;

-- If SECURITY DEFINER is truly needed (rare):
CREATE FUNCTION admin_only_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' -- CRITICAL for SECURITY DEFINER
AS $$
BEGIN
    -- Use fully qualified names for ALL objects
    INSERT INTO public.audit_log (action) VALUES ('Admin function executed');
END;
$$;
```

### 3.3 Grant Permissions
- **Table-level `SELECT/DELETE`:** Grant `SELECT` and `DELETE` permissions at the table level.
- **Column-level `INSERT/UPDATE`:** Grant `INSERT` and `UPDATE` permissions at the column level for explicitness and to avoid optimizer issues.
- **Avoid Column-level `SELECT`:** This severely limits optimizations and functionality (e.g., `SELECT *`, `RETURNING *`).
- **Avoid Table-level `INSERT/UPDATE`:** Lacks explicitness.

❌ BAD
```sql
GRANT SELECT (id, name) ON users TO authenticated; -- Avoid column-level SELECT
GRANT INSERT ON users TO authenticated; -- Avoid table-level INSERT
```

✅ GOOD
```sql
GRANT SELECT ON users TO authenticated;
GRANT DELETE ON users TO authenticated;
GRANT INSERT (name, email) ON users TO authenticated;
GRANT UPDATE (name, email) ON users TO authenticated;
```

## 4. Performance & Query Optimization

Optimize your database interactions for speed and efficiency.

### 4.1 Prefer `LANGUAGE SQL` for Functions
- **Inlining:** Use `LANGUAGE sql` over `LANGUAGE plpgsql` for functions whenever possible. SQL functions can often be inlined by the query planner, leading to significant performance gains.

❌ BAD
```sql
CREATE FUNCTION add_one(a int)
RETURNS int
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN a + 1;
END;
$$;
```

✅ GOOD
```sql
CREATE FUNCTION add_one(a int)
RETURNS int
LANGUAGE sql
IMMUTABLE -- Declare as IMMUTABLE if results depend only on inputs
AS $$
    SELECT a + 1;
$$;
```

### 4.2 Function Volatility
- **Immutable/Stable Defaults:** Declare functions as `IMMUTABLE` (returns same result for same inputs, no side effects) or `STABLE` (results change only within a single scan, no side effects) where appropriate. Default to `VOLATILE` only if the function modifies data or has external side effects. This allows PostgreSQL to optimize queries more effectively.

## 5. Testing & Linting

Ensure your database schema and functions are robust and error-free.

### 5.1 Database Testing
- **`supabase test db`:** Use the Supabase CLI (`supabase test db`) with `pgTAP` for comprehensive database unit and integration testing. Integrate this into your CI/CD pipeline.

### 5.2 Database Linting
- **`supabase db lint`:** Leverage `supabase db lint` (powered by `plpgsql_check`) to catch typing errors, unused variables, dead code, and potential SQL injection vulnerabilities early.

### 5.3 Type-Safe Query Builders
- **Kysely for Edge Functions:** For application code, especially in Edge Functions, use type-safe query builders like Kysely with `deno-postgres`. This provides compile-time guarantees and excellent autocompletion.

```typescript
// Example using Kysely in a Supabase Edge Function
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'https://deno.land/x/postgres@v0.17.0/mod.ts'; // Deno Postgres driver

interface Database {
  users: {
    id: number;
    email: string;
    created_at: Date;
  };
  posts: {
    id: number;
    user_id: number;
    title: string;
  };
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: 'postgres',
      hostname: Deno.env.get('DB_HOSTNAME'),
      user: 'postgres',
      password: Deno.env.get('DB_PASSWORD'),
      port: 5432,
      tls: { caCertificates: [Deno.env.get('DB_SSL_CERT')!] },
    }, 1), // Single connection pool for Edge Functions
  }),
});

// Type-safe query example
const user = await db.selectFrom('users')
  .where('id', '=', 1)
  .select(['id', 'email'])
  .executeTakeFirst();

console.log(user?.email); // Autocompletion and type safety
```
---
# Claude Code Prompt for Plan Mode
#prompts

Review this plan thoroughly before making any code changes. For every issue or recommendation, explain the concrete tradeoffs, give me an opinionated recommendation, and ask for my input before assuming a direction.

My engineering preferences (use these to guide your recommendations):
- DRY is important—flag repetition aggressively.
- Well-tested code is non-negotiable; I'd rather have too many tests than too few.
- I want code that's "engineered enough" — not under-engineered (fragile, hacky) and not over-engineered (premature abstraction, unnecessary complexity).
- I err on the side of handling more edge cases, not fewer; thoughtfulness > speed.
- Bias toward explicit over clever.

## 1. Architecture review
Evaluate:
- Overall system design and component boundaries.
- Dependency graph and coupling concerns.
- Data flow patterns and potential bottlenecks.
- Scaling characteristics and single points of failure.
- Security architecture (auth, data access, API boundaries).

## 2. Code quality review
Evaluate:
- Code organization and module structure.
- DRY violations—be aggressive here.
- Error handling patterns and missing edge cases (call these out explicitly).
- Technical debt hotspots.
- Areas that are over-engineered or under-engineered relative to my preferences.

## 3. Test review
Evaluate:
- Test coverage gaps (unit, integration, e2e).
- Test quality and assertion strength.
- Missing edge case coverage—be thorough.
- Untested failure modes and error paths.

## 4. Performance review
Evaluate:
- N+1 queries and database access patterns.
- Memory-usage concerns.
- Caching opportunities.
- Slow or high-complexity code paths.

**For each issue you find**

For every specific issue (bug, smell, design concern, or risk):
- Describe the problem concretely, with file and line references.
- Present 2–3 options, including "do nothing" where that's reasonable.
- For each option, specify: implementation effort, risk, impact on other code, and maintenance burden.
- Give me your recommended option and why, mapped to my preferences above.
- Then explicitly ask whether I agree or want to choose a different direction before proceeding.

**Workflow and interaction**
- Do not assume my priorities on timeline or scale.
- After each section, pause and ask for my feedback before moving on.

---

BEFORE YOU START:
Ask if I want one of two options:
1/ BIG CHANGE: Work through this interactively, one section at a time (Architecture → Code Quality → Tests → Performance) with at most 4 top issues in each section.
2/ SMALL CHANGE: Work through interactively ONE question per review section

FOR EACH STAGE OF REVIEW: output the explanation and pros and cons of each stage's questions AND your opinionated recommendation and why, and then use AskUserQuestion. Also NUMBER issues and then give LETTERS for options and when using AskUserQuestion make sure each option clearly labels the issue NUMBER and option LETTER so the user doesn't get confused. Make the recommended option always the 1st option.
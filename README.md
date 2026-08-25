# IndiaDits Real Estate Platform - Architecture & Implementation Guide

This guide details the complete full-stack implementation of the **IndiaDits Real Estate Platform**, demonstrating how data flows seamlessly across **Frontend → API → Backend → PostgreSQL → Backend → Frontend**.

---

## 1. Architectural Overview & Data Flow

```mermaid
graph TD
    A[Next.js 16 Frontend UI] -->|HTTP / REST JSON| B[Express.js 5 Backend API]
    B -->|JWT Middleware| C[Authentication & Authorization]
    B -->|Prisma 7 ORM + PgAdapter| D[(PostgreSQL Database)]
    D -->|Indexed Queries / Data| B
    B -->|Structured API Response| A
```

### Complete End-to-End Flow Example:
1. **User Auth**: User registers or logs in via Next.js UI (`/register` or `/login`). The request is sent to Express (`/api/v1/auth/login`). Password hash is verified using bcrypt in PostgreSQL, and JWT Access + Refresh Tokens are issued.
2. **Property Listing Creation**: Authenticated user posts a property from the Dashboard (`/dashboard`). The request goes to `POST /api/v1/properties` with JWT token. PostgreSQL stores the property record in the `Property` table.
3. **Property Search & Filter**: Visitors search properties on `/properties?city=Mumbai&propertyType=APARTMENT`. Express executes an indexed PostgreSQL query with pagination, returning real-time data to the UI.
4. **Lead Inquiry Submission**: Prospective buyer submits an inquiry modal (`LeadModal`). Request POSTs to `/api/v1/inquiries`. PostgreSQL checks for duplicate submissions within 1 hour before storing the inquiry.
5. **My Posted Listings & Leads Dashboard**: Property owners view their posted listings and received buyer inquiries directly from PostgreSQL via `GET /api/v1/properties/my-listings` and `GET /api/v1/inquiries/received`.

---

## 2. Important Files & Responsibilities

### A. Database Layer (PostgreSQL & Prisma ORM)

| File Path | Responsibility |
| :--- | :--- |
| [`backend/prisma/schema.prisma`](file:///d:/KARTHIKA/IndiaDits/backend/prisma/schema.prisma) | Defines PostgreSQL database models (`User`, `RefreshToken`, `Property`, `Inquiry`), Enums (`Role`, `PropertyType`, `ListingType`, `PropertyStatus`), and performance indexes. |
| [`backend/prisma.config.ts`](file:///d:/KARTHIKA/IndiaDits/backend/prisma.config.ts) | Provides Prisma CLI configuration specifying the PostgreSQL connection datasource. |
| [`backend/src/config/db.js`](file:///d:/KARTHIKA/IndiaDits/backend/src/config/db.js) | Initializes Prisma Client using `@prisma/adapter-pg` driver adapter with a PostgreSQL connection pool (`pg`). |
| [`backend/prisma/seed.js`](file:///d:/KARTHIKA/IndiaDits/backend/prisma/seed.js) | Populates PostgreSQL with realistic Indian real estate listings (Mumbai, Delhi, Bengaluru, etc.) and demo user accounts. |

### B. Backend Layer (Express.js API)

| File Path | Responsibility |
| :--- | :--- |
| [`backend/src/services/storeService.js`](file:///d:/KARTHIKA/IndiaDits/backend/src/services/storeService.js) | Service layer executing direct CRUD operations, similarity recommendations, and indexed queries on PostgreSQL via Prisma. |
| [`backend/src/controllers/authController.js`](file:///d:/KARTHIKA/IndiaDits/backend/src/controllers/authController.js) | Handles user registration, password hashing (`bcryptjs`), JWT token generation, refresh token management, and authentication checks. |
| [`backend/src/controllers/propertyController.js`](file:///d:/KARTHIKA/IndiaDits/backend/src/controllers/propertyController.js) | Handles public property searches, filter execution, property creation, updates, deletion, and owner listing retrievals. |
| [`backend/src/controllers/inquiryController.js`](file:///d:/KARTHIKA/IndiaDits/backend/src/controllers/inquiryController.js) | Handles buyer lead submissions and owner lead retrievals with duplicate suppression. |
| [`backend/src/app.js`](file:///d:/KARTHIKA/IndiaDits/backend/src/app.js) | Configures Express security middlewares (`helmet`, `cors`, rate limiters) and mounts API routes + Swagger OpenAPI docs (`/api-docs`). |
| [`backend/src/server.js`](file:///d:/KARTHIKA/IndiaDits/backend/src/server.js) | Starts the HTTP server on port 5000 and verifies PostgreSQL connection health on startup. |

### C. Frontend Layer (Next.js & React)

| File Path | Responsibility |
| :--- | :--- |
| [`frontend/src/lib/api.ts`](file:///d:/KARTHIKA/IndiaDits/frontend/src/lib/api.ts) | Axios client configured with JWT authorization interceptors and automatic refresh token rotation. |
| [`frontend/src/lib/authContext.tsx`](file:///d:/KARTHIKA/IndiaDits/frontend/src/lib/authContext.tsx) | Global React authentication state context for login, registration, user persistence, and logout. |
| [`frontend/src/app/page.tsx`](file:///d:/KARTHIKA/IndiaDits/frontend/src/app/page.tsx) | Landing page displaying curated popular properties directly from PostgreSQL via API. |
| [`frontend/src/app/properties/page.tsx`](file:///d:/KARTHIKA/IndiaDits/frontend/src/app/properties/page.tsx) | Search page with multi-param filter bar, pagination controls, and property cards grid. |
| [`frontend/src/app/properties/[id]/page.tsx`](file:///d:/KARTHIKA/IndiaDits/frontend/src/app/properties/%5Bid%5D/page.tsx) | Property detail page with gallery carousel, specs breakdown, view counter, and lead contact button. |
| [`frontend/src/app/dashboard/page.tsx`](file:///d:/KARTHIKA/IndiaDits/frontend/src/app/dashboard/page.tsx) | Owner management portal to view posted listings, create/edit property form, and inspect received lead inquiries. |
| [`frontend/src/components/LeadModal.tsx`](file:///d:/KARTHIKA/IndiaDits/frontend/src/components/LeadModal.tsx) | Contact modal submitting inquiries directly to PostgreSQL with real-time feedback. |

---

## 3. PostgreSQL Database & Prisma Studio Guide

### What is Prisma Studio?
**Prisma Studio** is an interactive, browser-based graphical data browser and visual editor provided by Prisma ORM. It allows developers to inspect, search, filter, insert, update, and delete database records across all tables (`User`, `Property`, `Inquiry`, `RefreshToken`) directly from an intuitive Web UI without writing raw SQL queries.

### How Prisma Studio Works with PostgreSQL
1. Prisma Studio reads the project schema file (`backend/prisma/schema.prisma`).
2. It connects to the backend PostgreSQL database using the `DATABASE_URL` specified in your environment configuration.
3. It launches a local web server communicating with PostgreSQL using Prisma Client under the hood, reflecting real-time database updates.

### Port Explanation: `http://localhost:5555` vs `http://localhost:51212`
* **Default Port (`5555`)**: By default, Prisma Studio attempts to start on port `5555` (`http://localhost:5555`).
* **Dynamic Port Allocation (`51212` or free port)**: If port `5555` is already occupied by another process, blocked by system settings, or if multiple instances are run, Prisma CLI automatically selects an available random free port (such as `51212`).
* **Which URL is Correct?**: Both are correct! `5555` is the standard default port, but **always use the exact URL outputted in your terminal** when launching Prisma Studio (`http://localhost:5555` or dynamic port like `http://localhost:51212`).

### Database Connection String
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/indiadits_db?schema=public"
```

### Visual Database Inspection via Prisma Studio
You can visually browse and edit your PostgreSQL tables in your browser using Prisma Studio. Refer to **Step 5** in Section 4 below for the launch command.

### Command Line Connection via `psql` / Docker
```bash
docker exec -it indiadits_postgres psql -U postgres -d indiadits_db
```
Inspection SQL queries:
```sql
-- View total properties stored
SELECT COUNT(*) FROM "Property";

-- View registered users
SELECT id, email, name, role, "createdAt" FROM "User";

-- View recent lead inquiries
SELECT i.name, i.email, i.phone, i.message, p.title 
FROM "Inquiry" i 
JOIN "Property" p ON i."propertyId" = p.id;
```

---

## 4. Minimal Step-by-Step Local Setup & Run Guide

### Demo Login Credentials
Use these pre-seeded accounts to log in at `http://localhost:3000/login`:

| User Role | Email | Password |
| :--- | :--- | :--- |
| **Demo User** | `demo@indiadits.com` | `Password123!` |
| **Demo Agent** | `agent@indiadits.com` | `Password123!` |

---

### Step 1: PostgreSQL Setup
Ensure PostgreSQL is running locally on port `5432` with database `indiadits_db`.

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/indiadits_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
```

---

### Step 2: Install Dependencies & Generate Prisma Client
*(Note: The Prisma client **must be generated** every time you run `npm install` or after any schema change. Without this step the backend will crash with a `MODULE_NOT_FOUND` error.)*

In the `backend` directory:
```bash
cd backend
npm install
npx prisma generate --schema=prisma/schema.prisma
```

> **Why is this needed?**  
> `@prisma/client` ships as an empty package. The `prisma generate` command reads your `schema.prisma` and writes the actual type-safe client code into `node_modules/@prisma/client`. The server cannot start without it.

---

### Step 3: Database Migration & Seeding
*(Note: Run these commands **only once during initial setup**. Data remains permanently saved in PostgreSQL once created.)*

Still inside the `backend` directory:
```bash
cd backend
npm run prisma:db:push
npm run prisma:seed
```
*(To seed 50,000 bulk records: `npm run seed:bulk`)*

---

### Step 4: Start Backend API
From the `backend` directory:
```bash
cd backend
npm run dev
```
* Backend API will run at `http://localhost:5000`
* Swagger API Documentation available at `http://localhost:5000/api-docs`

---

### Step 5: Start Frontend Application
In a new terminal, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
* Frontend UI will run at `http://localhost:3000`

---

### Step 6: Start Prisma Studio (View Data Browser)
In a new terminal:
```bash
# From backend directory:
cd backend
npx prisma studio
```
* Open the browser URL outputted in your terminal (`http://localhost:5555` or dynamic port `http://localhost:51212`).

---

### Alternative: Single-Command Full Stack Startup
You can launch both Frontend and Backend concurrently from the root workspace directory.  
⚠️ **Run `prisma generate` first** (one-time, after cloning or `npm install`):
```bash
# From root workspace directory:
npm install

# Generate Prisma client (required before first run or after schema changes)
cd backend && npx prisma generate --schema=prisma/schema.prisma && cd ..

# Then start everything
npm run dev
```

---

---

## 6. Vercel Deployment — Real Environment Variables (Key & Value)

Vercel Dashboard-la (`real-estate-hub-7cqt.vercel.app`) project settings-la **Environment Variables** add panna intha real **Key** and **Value** exact-ah use pannunga:

### 🌐 Project Base URL:
* **Deployed App Link**: `https://real-estate-hub-7cqt.vercel.app`
* **Swagger API Docs**: `https://real-estate-hub-7cqt.vercel.app/api-docs`

---

### A. Frontend Environment Variables (Client / Next.js)

| Key | Real Value | Explanation |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `/api/v1` *(or `https://real-estate-hub-7cqt.vercel.app/api/v1`)* | Relative API endpoint path for Vercel rewrites |

#### Copy-Paste Format for Vercel (Frontend):
```env
NEXT_PUBLIC_API_URL=/api/v1
```

---

### B. Backend Environment Variables (Server / Express & Prisma)

| Key | Real Value | Explanation |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.ztxryynxrbameqpectnl:K%40rthika0311@aws-0-ap-south-1.pooler.supabase.com:5432/postgres` | Live Supabase PostgreSQL Pooler connection URL |
| `JWT_ACCESS_SECRET` | `super_secret_access_token_key_indiadits_2026` | Secret key for JWT Access Token generation |
| `JWT_REFRESH_SECRET` | `super_secret_refresh_token_key_indiadits_2026` | Secret key for Refresh Token rotation |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifespan (15 minutes) |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifespan (7 days) |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (all domains allowed) |
| `NODE_ENV` | `production` | Vercel production environment flag |

#### Copy-Paste Format for Vercel (Backend):
```env
DATABASE_URL="postgresql://postgres.ztxryynxrbameqpectnl:K%40rthika0311@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
JWT_ACCESS_SECRET="super_secret_access_token_key_indiadits_2026"
JWT_REFRESH_SECRET="super_secret_refresh_token_key_indiadits_2026"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="*"
NODE_ENV="production"
```

---

## 7. Summary of Architecture & Feature Highlights

1. **Direct PostgreSQL Data Integration**: Fully backed by PostgreSQL using Prisma ORM 7 with zero mock data.
2. **Prisma 7 Driver Adapter Upgrade**: Configured `@prisma/adapter-pg` with a PostgreSQL connection pool (`pg`) for optimal query performance.
3. **JWT Authentication & Refresh Rotation**: Secure user login with access/refresh token rotation stored safely in client headers and state.
4. **Interactive Property Search & Filters**: Multi-parameter search (city, property type, price range, bedrooms, listing type) indexed directly on PostgreSQL.
5. **Owner & Lead Management**: Dashboard functionality for owners to post properties, edit listings, and review incoming buyer leads in real time.

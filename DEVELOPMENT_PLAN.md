# Chromalab Pro: Development Plan

## 1. Introduction

This document outlines the phased development plan to evolve Chromalab Pro from a client-side-only prototype into a secure, scalable, and robust web application. The current architecture exposes critical security vulnerabilities (API keys on the client) and lacks essential features like data persistence. This plan addresses these issues by introducing a backend API, a dedicated database, and a structured approach to feature development and quality assurance.

## 2. Milestones

### Milestone 1: Backend API & AI Service Abstraction
**Goal:** Eliminate the critical security risk of the exposed Google AI API key by creating a backend service to proxy all AI-related calls. This is the highest priority task.

**Acceptance Criteria:**
- A new `backend/` directory is created containing a standard Node.js/Express server.
- The `GEMINI_API_KEY` is completely removed from the frontend (`vite.config.ts`) and is only accessed via environment variables on the backend.
- The frontend is configured to proxy all requests from `/api/*` to the backend server running on a different port.
- The backend has new endpoints (e.g., `/api/ai/analyze-photo`, `/api/ai/generate-plan`) that securely call the Google AI APIs.
- The `services/geminiService.ts` file is refactored to replace all direct `GoogleGenAI` SDK calls with `fetch` requests to the new backend API endpoints.
- All AI-powered features in the application are fully functional, routing through the new backend service.

**File Changes:**
- **CREATE:**
  - `backend/package.json`
  - `backend/.env` (to hold the API key)
  - `backend/src/index.ts` (Express server setup)
  - `backend/src/routes/ai.ts` (AI proxy routes)
- **MODIFY:**
  - `vite.config.ts` (remove `define` block, add `server.proxy` configuration)
  - `services/geminiService.ts` (replace SDK calls with `fetch`)
  - `package.json` (add `concurrently` to run frontend and backend simultaneously)

---

### Milestone 2: Database Integration with Prisma & Postgres
**Goal:** Introduce a persistent data layer to store user data, client information, and formula sessions, enabling state to be saved.

**Acceptance Criteria:**
- A `docker-compose.yml` file is created at the root to run a Postgres database instance.
- Prisma is initialized in the `backend/` directory, connecting to the Dockerized Postgres DB.
- A `schema.prisma` file is defined with models for `User`, `Salon`, `Client`, and `FormulaSession`. The schema must include relations and tenancy keys (`userId`, `salonId`).
- Initial design notes for Row-Level Security (RLS) are added as comments in the schema file to guide future security hardening.
- The backend server is connected to the database via Prisma Client.
- Initial database migrations are generated and can be applied successfully.
- Basic CRUD API endpoints are created for `clients` and `sessions`.

**File Changes:**
- **CREATE:**
  - `docker-compose.yml`
  - `backend/prisma/schema.prisma`
  - `backend/prisma/migrations/`
  - `backend/src/routes/clients.ts`
  - `backend/src/routes/sessions.ts`
- **MODIFY:**
  - `backend/src/index.ts` (to add new routes and Prisma client)
  - `backend/.env` (to add `DATABASE_URL`)

---

### Milestone 3: Client Management UI & Persistence
**Goal:** Implement the missing "Client Management" feature, allowing stylists to save and retrieve their work.

**Acceptance Criteria:**
- A new "Clients" tab is added to the main UI.
- From this tab, a user can create, view a list of, and select a client.
- The "Intake & Analyze" and "Formula Builder" tabs are refactored to be aware of the "active client" context.
- When a formula is generated, it is saved as a `FormulaSession` linked to the active client.
- Users can view a history of past sessions for each client.
- A basic "Export to PDF/PNG" button is added to the formula plan view.

**File Changes:**
- **CREATE:**
  - `components/clients/ClientList.tsx`
  - `components/clients/ClientDetail.tsx`
  - `components/clients/ClientTab.tsx`
- **MODIFY:**
  - `App.tsx` (to manage global state for the active client)
  - `components/IntakeTab.tsx` (to link analysis to a client)
  - `components/PlanTab.tsx` (to save/load formulas)
  - `components/Tabs.tsx` (to add the new tab)

---

### Milestone 4: Enhance Simulation Studio
**Goal:** Evolve the Simulation Studio from a basic image editor into a more powerful, decoupled creative tool.

**Acceptance Criteria:**
- The Simulation Studio can be accessed and used without needing to first upload a photo on the "Intake" tab.
- A side-by-side or slider-based comparison view is implemented to show "Before" vs. "After" images.
- A "snapshot stack" feature is added, allowing a user to save multiple edits or generations as snapshots and easily switch between them.

**File Changes:**
- **MODIFY:**
  - `components/ImageStudioTab.tsx` (will require a significant refactor to support the new features and state management)

---

### Milestone 5: Testing, CI, and DX Hardening
**Goal:** Improve code quality, automate testing, and enhance the developer experience to prepare the application for production.

**Acceptance Criteria:**
- Unit/integration tests (Jest/RTL) are added for critical UI components (`Login.tsx`, `IntakeTab.tsx`) and backend services.
- End-to-end tests (Cypress) are created for core user flows like signing up and creating a complete formula.
- A GitHub Actions workflow (`.github/workflows/ci.yml`) is set up to run linting, testing, and builds on every push to the main branch.
- `.env.example` files are created for both the `frontend` and `backend` directories.
- Basic security headers (using a library like `helmet`) are added to the Express server.

**File Changes:**
- **CREATE:**
  - `e2e/cypress/integration/auth.spec.ts`
  - `components/auth/Login.test.tsx`
  - `.github/workflows/ci.yml`
  - `.env.example`
  - `backend/.env.example`
- **MODIFY:**
  - `backend/src/index.ts` (add `helmet` middleware)

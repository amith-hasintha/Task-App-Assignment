# TaskFlow — Professional Full-Stack Task Manager

A production-ready full-stack Task Management application built with a **NestJS** REST API, a **Next.js 14** (App Router) frontend, **Prisma ORM with SQLite**, and styled with **shadcn/ui** and **Tailwind CSS**.

Designed with clean architecture, enterprise-grade validation, complete test coverage, and a Linear/Notion-inspired user experience.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
   - [Core CRUD Functionality](#core-crud-functionality)
   - [Bonus Features](#bonus-features)
   - [Advanced Engineering Features](#advanced-engineering-features)
3. [Technology Stack](#technology-stack)
4. [Architecture Overview](#architecture-overview)
5. [Directory Structure](#directory-structure)
6. [Prerequisites](#prerequisites)
7. [Getting Started (Local Development)](#getting-started-local-development)
   - [1. Clone and Configure Environment](#1-clone-and-configure-environment)
   - [2. Backend Setup (`/api`)](#2-backend-setup-api)
   - [3. Frontend Setup (`/web`)](#3-frontend-setup-web)
8. [Docker Compose Deployment](#docker-compose-deployment)
9. [API Documentation](#api-documentation)
   - [Endpoints](#endpoints)
   - [Example Requests & Responses](#example-requests--responses)
10. [Validation & Error Handling](#validation--error-handling)
11. [Testing](#testing)
12. [Troubleshooting](#troubleshooting)
13. [How I Used AI](#how-i-used-ai)

---

## Project Overview

TaskFlow is designed to help teams and individuals organize tasks with clarity and speed. It consists of two decoupled applications:

- **`api/`**: NestJS backend providing a typed REST API with persistent SQLite database storage, DTO validation via `class-validator`, centralized error filtering, and health monitoring.
- **`web/`**: Next.js 14 frontend using the App Router, React Server and Client Components, `shadcn/ui`, `next-themes` (Dark/Light mode), and real-time dashboard analytics calculated from actual database records.

---

## Features

### Core CRUD Functionality
- **Create Task**: Intuitive modal dialog with title, description, status, and optional due date.
- **View Tasks**: Professional data table with status badges, formatted dates, and action menus.
- **Edit Task**: Reusable form dialog pre-populated with existing data.
- **Delete Task**: Confirmation modal using `AlertDialog` with destructive action safeguards.
- **Loading & Error States**: Pulse skeletons, empty states with call-to-actions, and retry triggers.
- **Toast Notifications**: Interactive feedback via `sonner` for all mutations.

### Bonus Features (All 3 Completed)
1. **Bonus 1 — Filter Tasks by Status**: Filter tasks by `All`, `TODO`, `IN_PROGRESS`, or `DONE` using a responsive select component synced with backend query parameters.
2. **Bonus 2 — Sort Tasks by Due Date**: Toggle sorting between earliest and latest due dates with consistent null handling, integrated alongside status filtering and search.
3. **Bonus 3 — Docker Compose**: Multi-container orchestration (`docker-compose.yml`) running the API and Web frontend with persistent SQLite storage, health checks, and service dependencies.

### Advanced Engineering Features
- **Global Search**: Debounced search across task titles and descriptions.
- **Server-Side Pagination**: Backend-driven pagination with configurable page sizes (5, 10, 20, 50).
- **Overdue Task Detection**: Automatic visual highlighting (badges, warning icons, table row accents) for non-completed tasks past their due date.
- **Quick Status Updates**: Change task status directly from the table using inline dropdowns with immediate UI feedback and rollback on error.
- **Dark & Light Themes**: Persistent theme switching powered by `next-themes` with tailored Tailwind Slate palettes.
- **API Connectivity Indicator**: Periodic background health polling displaying live API and SQLite connectivity status.

---

## Technology Stack

### Backend (`/api`)
- **Runtime**: Node.js v20+ / v24 LTS
- **Framework**: NestJS v12
- **Language**: TypeScript
- **Database & ORM**: SQLite with Prisma ORM v5
- **Validation**: `class-validator`, `class-transformer`
- **Testing**: Vitest, `@nestjs/testing`

### Frontend (`/web`)
- **Framework**: Next.js 14 (App Router)
- **Library**: React 18, TypeScript
- **UI Components**: `shadcn/ui` (Radix UI primitives)
- **Styling**: Tailwind CSS, `tailwindcss-animate`
- **Form Handling**: React Hook Form, Zod resolver
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Theme**: `next-themes`
- **Date Formatting**: `date-fns`

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Package Manager**: npm 10+
- **VCS**: Git

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          Next.js Frontend (web)        │
                      │  - App Router: /dashboard, /tasks      │
                      │  - shadcn/ui + Tailwind CSS            │
                      │  - React Hook Form + Zod               │
                      └───────────────────┬────────────────────┘
                                          │ HTTP / REST
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          NestJS Backend (api)          │
                      │  - ValidationPipe (whitelist/forbid)   │
                      │  - TasksController & HealthController  │
                      │  - TasksService (Business Logic)       │
                      │  - HttpExceptionFilter                 │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          Prisma ORM & SQLite           │
                      │  - Task Model                          │
                      │  - Persistent storage (dev.db)         │
                      └────────────────────────────────────────┘
```

- **Separation of Concerns**: Controllers manage HTTP mapping; Services encapsulate business logic and database access; DTOs enforce contract validation.
- **Predictable API Responses**: Global `HttpExceptionFilter` ensures standard error JSON formatting (`statusCode`, `message`, `error`, `timestamp`, `path`).

---

## Directory Structure

```
Task-App-Assignment/
├── .env.example                # Root environment template
├── .gitignore                  # Git ignore rules
├── docker-compose.yml          # Multi-container orchestration
├── README.md                   # Project documentation
│
├── api/                        # NestJS REST API
│   ├── Dockerfile              # Production multi-stage Docker build
│   ├── .dockerignore
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema definition
│   │   └── migrations/         # Auto-generated SQLite migrations
│   └── src/
│       ├── main.ts             # Application bootstrap & pipes
│       ├── app.module.ts       # Root module
│       ├── common/
│       │   └── filters/        # Global HttpExceptionFilter
│       ├── health/             # Health check & DB ping
│       ├── prisma/             # PrismaService provider
│       └── tasks/
│           ├── tasks.module.ts
│           ├── tasks.controller.ts
│           ├── tasks.service.ts
│           ├── tasks.service.spec.ts    # Service unit tests
│           ├── tasks.controller.spec.ts # Controller tests
│           ├── dto/
│           │   ├── create-task.dto.ts
│           │   ├── update-task.dto.ts
│           │   └── query-tasks.dto.ts
│           └── enums/
│               └── task-status.enum.ts
│
└── web/                        # Next.js App Router Frontend
    ├── Dockerfile              # Production multi-stage Docker build
    ├── .dockerignore
    ├── .env.example
    ├── components.json         # shadcn/ui configuration
    ├── package.json
    ├── tailwind.config.ts
    └── src/
        ├── app/
        │   ├── layout.tsx      # Root layout (ThemeProvider, Toaster)
        │   ├── page.tsx        # Redirects to /dashboard
        │   ├── globals.css     # Theme variables (CSS vars)
        │   └── (app)/
        │       ├── layout.tsx  # Sidebar + Header layout
        │       ├── dashboard/  # Dashboard page
        │       └── tasks/      # Task management page
        ├── components/
        │   ├── ui/             # Radix / shadcn/ui components
        │   ├── layout/         # AppSidebar, AppHeader
        │   ├── shared/         # ThemeToggle, ApiStatus, Pagination
        │   ├── dashboard/      # DashboardContent, stats cards
        │   └── tasks/          # TaskTable, TaskFormDialog, etc.
        ├── hooks/              # useTasks, useDebounce
        ├── lib/                # api.ts client, utils.ts, validations
        ├── providers/          # ThemeProvider
        └── types/              # Shared TypeScript interfaces
```

---

## Prerequisites

- **Node.js**: v20.x or v24.x LTS (Recommended: v24.19.0)
- **Package Manager**: npm v10.x or higher
- **Docker**: Docker Desktop with Docker Compose v2 (optional, for containerized run)

---

## Getting Started (Local Development)

### 1. Clone and Configure Environment

```bash
git clone <repository-url>
cd Task-App-Assignment
```

Copy the example environment files:

```bash
# On Linux / macOS:
cp .env.example .env
cp api/.env.example api/.env
cp web/.env.example web/.env.local

# On Windows PowerShell:
Copy-Item .env.example .env
Copy-Item api/.env.example api/.env
Copy-Item web/.env.example web/.env.local
```

### 2. Backend Setup (`/api`)

Open a terminal and navigate to `api`:

```bash
cd api
npm install
```

Generate the Prisma client and apply database migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Start the NestJS development server:

```bash
npm run start:dev
```

The API will be running at **`http://localhost:3001`**.  
Verify health: `http://localhost:3001/health`.

### 3. Frontend Setup (`/web`)

Open a second terminal and navigate to `web`:

```bash
cd web
npm install
npm run dev
```

The Next.js frontend will be running at **`http://localhost:3000`**.  
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Docker Compose Deployment

To build and run both the API and Web applications in isolated Docker containers:

```bash
docker compose up --build
```

### What this command does:
1. Builds the NestJS API container using multi-stage Docker builds.
2. Applies Prisma migrations automatically inside the container.
3. Builds the Next.js production bundle.
4. Mounts a persistent Docker volume (`api-data`) so SQLite data survives container restarts.
5. Runs health checks on the API before connecting the Web frontend.

To stop the containers:

```bash
docker compose down
```

---

## API Documentation

Base URL: `http://localhost:3001`

### Endpoints

| Method | Endpoint | Description | Query Parameters / Body |
|---|---|---|---|
| `GET` | `/health` | Server and database health check | None |
| `GET` | `/tasks` | Retrieve paginated task list | `status`, `search`, `sortDueDate`, `page`, `limit` |
| `GET` | `/tasks/:id` | Retrieve single task by ID | `id` (path) |
| `POST` | `/tasks` | Create a new task | `{ title, description?, status?, dueDate? }` |
| `PATCH` | `/tasks/:id` | Update an existing task | `{ title?, description?, status?, dueDate? }` |
| `DELETE` | `/tasks/:id` | Delete task by ID | `id` (path) |

### Example Requests & Responses

#### 1. Create a Task
```bash
POST /tasks
Content-Type: application/json

{
  "title": "Complete technical assessment",
  "description": "Implement NestJS API and Next.js frontend",
  "status": "IN_PROGRESS",
  "dueDate": "2026-11-20T18:00:00.000Z"
}
```

Response (`201 Created`):
```json
{
  "id": "c1f7a0b3-4f9e-4a62-9e3e-4b21a8d05e21",
  "title": "Complete technical assessment",
  "description": "Implement NestJS API and Next.js frontend",
  "status": "IN_PROGRESS",
  "dueDate": "2026-11-20T18:00:00.000Z",
  "createdAt": "2026-11-16T18:46:10.298Z",
  "updatedAt": "2026-11-16T18:46:10.298Z"
}
```

#### 2. Query Tasks with Filtering, Search & Sorting
```bash
GET /tasks?status=IN_PROGRESS&search=technical&sortDueDate=asc&page=1&limit=10
```

Response (`200 OK`):
```json
{
  "data": [
    {
      "id": "c1f7a0b3-4f9e-4a62-9e3e-4b21a8d05e21",
      "title": "Complete technical assessment",
      "description": "Implement NestJS API and Next.js frontend",
      "status": "IN_PROGRESS",
      "dueDate": "2026-11-20T18:00:00.000Z",
      "createdAt": "2026-11-16T18:46:10.298Z",
      "updatedAt": "2026-11-16T18:46:10.298Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### 3. Update Task Status
```bash
PATCH /tasks/c1f7a0b3-4f9e-4a62-9e3e-4b21a8d05e21
Content-Type: application/json

{
  "status": "DONE"
}
```

#### 4. Delete a Task
```bash
DELETE /tasks/c1f7a0b3-4f9e-4a62-9e3e-4b21a8d05e21
```

Response (`200 OK`):
```json
{
  "message": "Task deleted successfully"
}
```

---

## Validation & Error Handling

- **Global ValidationPipe**: Configured with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`. Unexpected request body fields or malformed values are rejected with `400 Bad Request`.
- **404 Not Found**: Querying, updating, or deleting a non-existent task returns a structured `404 Not Found` response.
- **Standardized Error Format**:
```json
{
  "statusCode": 400,
  "message": ["Title must not be empty"],
  "error": "Bad Request",
  "timestamp": "2026-11-16T18:50:00.000Z",
  "path": "/tasks"
}
```
- **Security**: Stack traces are logged server-side and never exposed to the client in production.

---

## Testing

Comprehensive unit tests cover both service and controller logic across CRUD, filtering, pagination, sorting, search, and error conditions.

Run backend tests:

```bash
cd api
npm test
```

### Test Coverage Highlights:
- Task creation with default and optional fields
- Paginated retrieval and total counts
- Filtering by task status (`TODO`, `IN_PROGRESS`, `DONE`)
- Title and description search queries
- Due date sorting (`asc` and `desc`)
- Custom page size and skip calculations
- `NotFoundException` handling for invalid IDs
- Controller HTTP response formatting and parameter forwarding

---

## Troubleshooting

- **Port Conflict (3000 or 3001 in use)**:  
  Set alternate ports via environment variables: `PORT=3002` in `api/.env` and adjust `NEXT_PUBLIC_API_URL` in `web/.env.local`.
- **Prisma Client Missing**:  
  Run `npx prisma generate` inside `/api`.
- **Database Lock on SQLite**:  
  Ensure only one process holds write locks on `dev.db`, or restart the server process.

---

## How I Used AI

### AI Assistance
- **Scaffolding and Project Setup**: AI tools were utilized to generate initial boilerplate project configurations for NestJS and Next.js, structure DTO validation schemas, and draft standard shadcn/ui component implementations.
- **Test Generation**: Generated test mocks and edge-case test suites for the Tasks service and controller.
- **Docker & Compose Configurations**: Drafted multi-stage Dockerfiles and container orchestration rules.

### Developer Modifications & Verification (Manual Work)
<!-- You can customize and expand this section to describe your own modifications and reviews -->
- **Prisma SQLite Schema Alignment**: Resolved Prisma SQLite connector constraints regarding native enums by standardizing enum representation via TypeScript enums and string database mappings.
- **TypeScript 6 & Node.js 24 Compatibility**: Configured `ignoreDeprecations: "6.0"` in tsconfig to address Node 10 module resolution changes in newer TypeScript releases.
- **Zod & React Hook Form Type Harmonization**: Refined Zod schema definitions to guarantee strict input/output type compatibility with the `@hookform/resolvers/zod` package.
- **End-to-End API and UI Verification**: Tested all endpoints, filters, pagination, dark/light theme switching, and error recovery using live HTTP calls and production build cycles.

# 🏋️‍♂️ Gym Analytics — Frontend Web Application

> **Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui + TanStack Query + Zustand + Recharts**  
> Responsive, modern, high-performance web client for the Gym Analytics & Body Progress Platform.

---

## 📖 Single Source of Truth References

- **Frontend Agent Skill & Architecture Standards**: [`.agents/skills/nextjs-frontend/SKILL.md`](../.agents/skills/nextjs-frontend/SKILL.md)
- **UI/UX Design Specification & Tokens**: [`design-fe.md`](../design-fe.md)
- **Product Requirements Document (PRD)**: [`prd.md`](../prd.md)
- **Repository Navigation Map**: [`.agents/path-file.md`](../.agents/path-file.md)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server-rendered & client-rendered modern web framework |
| **UI Library** | React 19 | UI component architecture |
| **Styling** | Tailwind CSS v4 | Utility-first CSS styling system |
| **Component Kit** | shadcn/ui + Radix UI | Accessible, composable UI primitives |
| **Icons** | Lucide React | High quality UI icon set |
| **Data Fetching** | TanStack Query v5 | Server state caching, optimistic updates, query invalidation |
| **Client State** | Zustand | Lightweight client UI state (live workout timer, sidebar, filters) |
| **Forms** | React Hook Form + Zod | Form validation aligned with backend API schemas |
| **Visualizations** | Recharts | Volume trends, 1RM progression, macro breakdowns, body composition |
| **HTTP Client** | Axios / Fetch Wrapper | Interceptors for Bearer JWT injection & 401 token refresh/logout |

---

## 🏗️ Folder Structure

Following the architectural standards defined in `.agents/skills/nextjs-frontend/SKILL.md`:

```text
gym-analytics-frontend/src/
├── app/                                  # Next.js App Router
│   ├── (auth)/                           # Auth route group (login, register, forgot-password, verify)
│   ├── (dashboard)/                      # Protected dashboard routes (overview, analytics, history)
│   ├── profile/                          # User biometric profile, targets, & reminder settings
│   ├── workout/                          # Live workout tracker & logging engine
│   ├── nutrition/                        # Calorie & macro tracking logs
│   ├── layout.tsx                        # Root layout with QueryClient & Theme providers
│   └── page.tsx                          # Landing / Gateway page
│
├── components/
│   ├── ui/                               # Atomic shadcn/ui components (button, input, dialog, card)
│   ├── common/                           # Shared reusable components (navbar, sidebar, stat-card, metric-pill)
│   ├── charts/                           # Recharts wrappers (volume-trend, 1rm-progress, macro-radial)
│   └── modules/                          # Feature-specific widget components (auth, profile, workout, calorie)
│
├── hooks/                                # Custom reusable React hooks (useAuth, useTimer, useProfile)
├── stores/                               # Zustand global client state stores (workoutStore, uiStore)
├── services/                             # API service clients & TanStack Query hooks
│   ├── api-client.ts                     # Axios/Fetch base instance with JWT interceptor
│   ├── auth.service.ts                   # Auth endpoints
│   ├── profile.service.ts                # Profile & biometric endpoints
│   └── calorie.service.ts                # Calorie target & preview simulation endpoints
│
├── types/                                # TypeScript interface & DTO definitions matching backend Zod
└── lib/                                  # Helper utilities (formatters, date utils, class merge 'cn')
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `>= 20.x`
- **pnpm**: `>= 9.x`

### 2. Installation & Setup
```bash
cd gym-analytics-frontend

# Install dependencies
pnpm install

# Setup Environment Variables
cp .env.example .env.local
```

### 3. Configure `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api/v1"
```

### 4. Run Development Server
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the active port shown in terminal) in your browser.

---

## 🧪 Testing & Code Quality

```bash
# Run ESLint check
pnpm run lint

# TypeScript Typecheck
pnpm tsc --noEmit

# Build Production Bundle
pnpm run build
```

---

## 📄 License

Private Repository — Hak Cipta Terpelihara &copy; 2026 Gym Analytics Platform.

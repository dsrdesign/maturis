# Maturis - AI Copilot Instructions

## Project Overview
Maturis is a **COBIT 2019 IT governance maturity assessment platform** built with Next.js 16 + React 19. It evaluates organizations across 5 COBIT domains (EDM, APO, BAI, DSS, MEA) through AI-generated questionnaires.

## Architecture

### State Management (Zustand)
All state is centralized in [app/lib/store.ts](app/lib/store.ts) with localStorage persistence (`maturis-storage` key).

**Use domain-specific hooks, not `useStore` directly:**
```typescript
import { useAuth, useOrganizations, usePermissions, useSystem, useQCM } from '@/app/lib/store';
// ✗ Don't: useStore((state) => state.user)
// ✓ Do: const { user } = useAuth();
```

### Multi-tenant System Model
- `System` → contains multiple `Organization` + `User`
- Users have `organizationIds[]` limiting visibility
- Three roles with distinct permissions:
  - `admin`: Full access (users, organizations, evaluations, results, export)
  - `decideur`: Organization & evaluation management (results + export, no user management)
  - `evaluation`: Launch evaluations only (no results, no export, no org management)
- Permission checks via `usePermissions()` hook (e.g., `canRunQCM`, `canViewResults`, `canManageUsers`)

### COBIT Domain Scoring
Organizations are scored 0-5 on each domain with sector-specific weights defined in [app/lib/score.ts](app/lib/score.ts):
```typescript
// Domain keys: 'EDM' | 'APO' | 'BAI' | 'DSS' | 'MEA'
computeGlobalScore(domainScores, sector, customWeights?)
```

## Key Conventions

### File Structure
- `app/(app)/` - Main authenticated routes (organizations dashboard)
- `app/api/ai/` - AI endpoints (question generation, recommendations)
- `app/lib/` - Store, types, utilities, questionnaires
- `components/` - Shared React components

### Type Definitions
Core types in [app/lib/types.ts](app/lib/types.ts): `Organization`, `System`, `User`, `UserRole`
Permission types in [app/lib/authMockData.ts](app/lib/authMockData.ts)

### Auth Flow
1. `AuthProvider` wraps app in [app/layout.tsx](app/layout.tsx)
2. Use `useAuth()` for `user`, `isLoading`, `login()`, `logout()`
3. Always check `isLoading` before redirecting unauthenticated users

### Dynamic Imports
Heavy visualization components use `next/dynamic` with SSR disabled:
```typescript
const RadarChart = dynamic(() => import('@/components/RadarChart'), { ssr: false });
```

## AI Integration
- Questions generated per-organization context via `/api/ai/generate-questions`
- Recommendations via `/api/ai/recommendations`
- Prompts are sector-aware (health, finance, industry) - see domain prompts in [app/api/ai/generate-questions/route.ts](app/api/ai/generate-questions/route.ts)

## Development Commands
```bash
npm run dev    # Start dev server (localhost:3000)
npm run build  # Production build
npm run lint   # ESLint
```

## Testing Auth
Default credentials in [app/lib/authMockData.ts](app/lib/authMockData.ts):
- Admin: `admin@maturis.com` / `admin123`
- Décideur: `decideur@maturis.com` / `password123`
- Évaluateur: `evaluateur@maturis.com` / `password123`

## Critical Notes
- **French UI** - All user-facing strings are in French
- **No backend** - All data persisted in localStorage via Zustand
- Clear storage for fresh state: `localStorage.removeItem('maturis-storage')`
- When adding organizations, system assigns them via `currentSystem.organizationIds`

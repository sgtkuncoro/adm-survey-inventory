# Next.js 15 & Frontend Rules

## Core Stack

- **Framework**: Next.js 15 (App Router) - _Planned Extension_
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **State**: Zustand (global client state), TanStack Query (server state/caching)
- **Forms**: TanStack Form + Zod validation
- **Auth**: Supabase Auth

## App Router Patterns

- **Directory Structure**:
  - `app/(auth)`: Auth routes group
  - `app/(dashboard)`: Protected dashboard routes
  - `components/ui`: atomic UI components (from shadcn)
  - `components/features`: domain-specific components
- **Data Fetching**:
  - Use Server Components for initial data fetching where possible.
  - Use TanStack Query for client-side interactions and mutations.
- **Server Actions**:
  - Use Server Actions for form submissions and mutations.
  - Validated inputs with Zod.

## Components

- **Client Components**: Mark with `"use client"` at the TOP of the file.
- **Shadcn UI**: Do not modify core shadcn components unless necessary for theming. Extend specific components via props or compositions.

## Deployment

- Deploy to Cloudflare Pages (preferred) or Vercel.
- Use `@cloudflare/next-on-pages` adapter if deploying to Pages.

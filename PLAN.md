# MCPStudio Build Plan

## Overview
No-code MCP server builder. Next.js 14 App Router + Supabase + ReactFlow + Vercel deployment.

## Architecture
- **Frontend**: Next.js 14 (App Router), React 18, ReactFlow, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL) + Supabase Auth
- **Payments**: Stripe (checkout + webhooks)
- **Deployment**: Vercel Deployments API
- **Code Gen**: Handlebars templates (Python + TypeScript MCP servers)

## Build Phases
1. Foundation (Next.js, Tailwind, layout, landing, pricing)
2. Auth + Dashboard (Supabase Auth, server CRUD)
3. Visual Builder (ReactFlow canvas, ToolNode, API config form, output mapping)
4. Code Generation (Handlebars templates, Python + TypeScript)
5. Testing (API proxy, test UI)
6. Deployment (Vercel API, deploy flow, MCP config output)
7. Payments (Stripe checkout, webhooks, tier enforcement)
8. Docs + Polish (documentation page, error handling, responsive)

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
VERCEL_API_TOKEN=
NEXT_PUBLIC_APP_URL=
```

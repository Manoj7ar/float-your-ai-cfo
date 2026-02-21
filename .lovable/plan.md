

# Float — AI CFO Platform (Phase 1)

## Overview
Build the core of Float: a light-themed financial dashboard for small businesses that connects to Monzo, analyzes cashflow with AI, and displays real-time financial health. Phase 1 delivers a fully functional onboarding flow, main dashboard, and the dramatic "Fix It" crisis modal — all powered by Supabase Cloud.

---

## 1. Supabase Cloud Setup & Database
Set up all database tables as specified: accounts, transactions, invoices, ai_insights, incidents, cashflow_projections, chat_messages, and calls. All tables have Row Level Security. Money stored as integers in pence. Enable Realtime on invoices, incidents, calls, ai_insights, and cashflow_projections.

## 2. Design System — Light Theme
Adapt the dark color palette to a clean, professional light theme:
- White/light grey page backgrounds
- White cards with subtle borders and shadows
- Dark text for readability
- Keep the accent colors: electric blue (#3b82f6), green (#10b981), amber (#f59e0b), red (#ef4444), Monzo coral (#ff4c4c)
- Import Geist Sans (body text) and Geist Mono (numbers, money, timers)
- Tabular numerics on all financial values

## 3. App Layout (Sidebar + Top Bar)
Shared layout across all pages:
- **Left sidebar (240px):** Float logo + wave icon, business name, nav links (Dashboard, AI Chat, Calls, Incidents, Settings) with Lucide icons, active state in blue pill, Monzo connection status at bottom
- **Top bar (60px, sticky):** Page title, "Ask Float anything..." search bar, refresh button, notification bell with badge, avatar with business initials
- Light theme styling with subtle borders and clean shadows

## 4. Onboarding Flow (5 Steps)
Full-screen multi-step wizard:
1. **Welcome** — "Welcome to Float" headline, "Get Started" button
2. **Business Details** — Conversational one-question-at-a-time form (business name, sector pills, employee count, payroll amount, frequency, payday). Each answer saved to Supabase in real time
3. **Connect Monzo** — Monzo OAuth redirect with trust bullets (read-only, encrypted, disconnect anytime)
4. **Syncing** — Animated checklist (5 steps ticking off sequentially)
5. **Demo Mode toggle** — Option to load The Cobblestone Kitchen mock data for testing, then enter dashboard

## 5. Mock Data — The Cobblestone Kitchen
Pre-loaded demo scenario:
- Restaurant with 8 employees, €8,400 payroll, €6,200 balance, payroll at risk
- 2 overdue invoices (TechCorp €2,400 and EventsPro €1,800)
- 4 AI insights (critical payroll risk, Thursday cost pressure, payment pattern, Friday revenue)
- 1 P1 incident (payroll crisis)
- 90 days of realistic restaurant transactions
- 30-day cashflow projection showing the crisis point

## 6. Main Dashboard
The centerpiece of the app:

### Crisis Banner (3 states)
- **Healthy:** Compact green bar — "Cashflow healthy"
- **Warning:** Amber bar with action link
- **Critical:** Large red-tinted banner with live countdown timer (HH:MM:SS in Geist Mono), shortfall amount, and pulsing "Fix It Now — Declare Mayday" button

### KPI Cards (4-card grid)
- Current Balance (with Monzo live indicator)
- Payroll Coverage (green when covered, red glow when at risk)
- Outstanding Invoices (with overdue count badge)
- Runway (days remaining with color-coded progress bar)

### Cashflow Chart
Recharts AreaChart: 30 days historical + 30 days projected, payroll threshold line, red danger zone below threshold, date flags for key events, animated drawing on load

### Two-Column Section
- **Left (60%):** Invoice table with status badges (upcoming/unpaid/overdue/chasing/paid), chase and payment link action buttons, real-time updates via Supabase Realtime
- **Right (40%):** AI Insights panel with color-coded cards, dismiss functionality, action buttons

### Benchmarking Panel
Industry comparison table (Dublin Restaurants) with 6 metrics, color-coded status indicators

## 7. The Fix It Modal
The dramatic crisis resolution experience:
- Full-screen overlay with terminal-style activity log
- Lines appear sequentially (analyzing shortfall → creating Stripe link → initiating AI call)
- Live call panel with animated soundwave (14 CSS-animated bars) and counting timer
- Resolution sequence driven by Supabase Realtime events
- Animated green checkmark on resolution with summary stats
- Dashboard auto-updates when modal closes

## 8. Edge Functions (Phase 1)
- **monzo-auth / monzo-callback:** OAuth flow for Monzo connection
- **monzo-transactions:** Sync 90 days of transactions
- **monzo-balance:** Fetch current balance
- **ai-analyze:** Send transaction data to Lovable AI for cashflow analysis, risk assessment, and insight generation
- **stripe-payment-link:** Create Stripe payment links for invoices
- **stripe-webhook:** Handle payment confirmations, update invoices and incidents

## 9. Animations
- Staggered fade-in + slide-up on page load (nav → banner → KPIs → chart)
- Scroll-triggered reveals via IntersectionObserver
- Crisis banner color transitions (500ms)
- Fix It modal slide-up entrance
- Card hover lift effects
- Activity log line fade-ins

## 10. Supabase Realtime
Live subscriptions on the dashboard for: invoices, ai_insights, cashflow_projections, and incidents — so the UI updates instantly when data changes (especially during the Fix It flow).

---

## What's in Phase 2 (later)
- AI Chat page (conversational interface with Lovable AI)
- Calls page (ElevenLabs + Twilio call management)
- Incidents page (full incident timeline management)
- Invoice PDF upload with AI extraction
- Monzo webhook for real-time transaction sync


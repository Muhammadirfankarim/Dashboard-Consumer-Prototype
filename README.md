# BRISpot Bad Data Monitoring & Escalation Dashboard

Deployable MVP web app for **BRI Kantor Cabang Sudirman Semanggi** to monitor dummy bad data cases in the Consumer credit origination flow, especially **KPR** and **Briguna**.

> **Privacy note:** MVP uses dummy data only and is not intended for real customer data. Do not enter real CIF, customer names, or phone numbers.

## Business Context

Branch teams need a simple way to document BRISpot bad data issues, run pre-screening checks before prakarsa, monitor SLA follow-up, and generate standardized escalation text for OPX/PO coordination. This app does not connect to BRISpot or any internal BRI system.

## Features

- Dashboard KPI cards and Recharts analytics.
- Bad Data Register CRUD with search, filters, SLA overdue calculation, close/delete actions, and Excel export.
- Masked CIF, customer name, and phone number in all tables/reports.
- Pre-screening checklist with phone normalization from `62` to `0`.
- Failed checklist warning and automatic bad data case creation.
- Escalation template generator in Indonesian with copy-to-clipboard and mark-as-escalated action.
- Reports page with period summary, top issues, overdue cases, RM/product breakdown, and Excel export.
- Settings page for CSV template download, sample data load/reset, and role simulation.
- Role selector: Admin, RM, Viewer.

## Screenshots

Add screenshots after deployment:

- Dashboard
- Bad Data Register
- Checklist Pre-screening
- Escalation Generator
- Reports

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase JavaScript client
- Supabase Free database
- Recharts
- xlsx
- Zod
- Lucide React icons

## Supabase Setup

1. Create a free Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. Go to **Project Settings > API**.
6. Copy Project URL and anon public key.

The schema enables permissive RLS policies for this dummy-data MVP because authentication is simulated through a role selector. Do not use these policies for real customer data.

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

`.env.example` is included.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Optional checks:

```bash
npm run test
npm run lint
npm run build
```

## Dependency Audit Note

The app upgrades to Next.js 16 and React 19 to reduce framework audit findings. npm may still report advisories for `xlsx` because the requested SheetJS `xlsx` npm package has no fixed npm release for those advisories. This MVP only exports dummy, app-generated rows and does not parse uploaded Excel files.

## Vercel Deployment

1. Push this repository to GitHub.
2. Import the project in Vercel Hobby plan.
3. Framework preset: **Next.js**.
4. Build command: `npm run build`.
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy.

The app uses `output: "export"`, so Vercel serves it as a static browser app while Supabase handles persistence.

## Cloudflare Pages Deployment

1. Push this repository to GitHub.
2. Create a Cloudflare Pages project.
3. Framework preset: **Next.js** or custom static build.
4. Build command: `npm run build`.
5. Output directory: `out`.
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Deploy.

## Cloudflare Workers Static Assets Deployment

If the project is created under Workers Builds instead of Pages, use the included
`wrangler.jsonc`.

Recommended settings:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Node version: provided by `.node-version` as `22.16.0`
- Build variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The Worker name in `wrangler.jsonc` is `dashboardconsumerkcss` and should match the
Cloudflare Worker service name.

## Demo User Flow

1. Open Dashboard to review KPI cards and issue charts.
2. Go to Bad Data Register and add a dummy case.
3. Confirm CIF, customer name, and phone display are masked.
4. Run Checklist Pre-screening with phone `628000000001`.
5. Review normalization suggestion to `080000000001`.
6. Uncheck a critical item and click **Buat Kasus dari Checklist**.
7. Open Escalation Generator, select the case, copy the template, and mark it escalated.
8. Open Reports and export the summary workbook.

## Data Privacy

- Use dummy/sample data only.
- Do not use real CIF, real customer names, or real phone numbers.
- Do not connect to BRISpot or any BRI internal system.
- CIF is displayed as `******1234`.
- Phone number is normalized and displayed as `0812****7890`.
- Customer name is displayed as `N****** D**** 01`.

## CSV Template

The Settings page provides a CSV template download. Full CSV import is intentionally not enabled in this MVP; cases should be entered through the validated register form.

## Future Enhancements

- Real BRISpot integration.
- Role-based authentication.
- Email/Teams/WhatsApp escalation integration.
- SLA reminder notifications.
- Approval workflow.
- Dashboard for branch leader.
- Export PDF report.

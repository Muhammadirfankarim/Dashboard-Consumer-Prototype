# Technical Documentation

Dokumen ini menjelaskan arsitektur teknis, struktur kode, data model, dan flow aplikasi **BRISpot Bad Data Monitoring & Escalation Dashboard**.

## 1. Ringkasan Teknis

Tujuan aplikasi:

- Monitoring bad data case untuk proses Consumer credit origination.
- Pre-screening checklist sebelum prakarsa.
- Eskalasi terstruktur ke OPX/PO.
- Export report ke Excel.

Stack:

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- Supabase JavaScript client.
- Supabase PostgreSQL.
- Recharts.
- xlsx.
- Zod.
- Lucide React.

Deployment:

- Cloudflare Workers Static Assets via `wrangler.jsonc`.
- Static output dari Next.js `output: "export"`.
- Persistent data di Supabase.

## 2. Struktur Project

```text
.
├── docs/
│   ├── technical-documentation.md
│   ├── user-guide.md
│   └── images/
├── public/
│   └── brispot-consumer-logo.png
├── src/
│   ├── app/
│   │   ├── dashboard/page.tsx
│   │   ├── register/page.tsx
│   │   ├── checklist/page.tsx
│   │   ├── escalation/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   ├── lib/
│   └── types/
├── supabase/
│   ├── schema.sql
│   └── seed.sql
├── next.config.js
├── wrangler.jsonc
├── package.json
└── package-lock.json
```

## 3. Route Map

| Route | Page | Purpose |
|---|---|---|
| `/` | Home redirect/render dashboard | Entry point |
| `/dashboard/` | Dashboard | KPI dan chart monitoring |
| `/register/` | Bad Data Register | CRUD case |
| `/checklist/` | Checklist Pre-screening | Checklist sebelum prakarsa |
| `/escalation/` | Escalation Generator | Template eskalasi |
| `/reports/` | Reports | Summary dan export |
| `/settings/` | Settings | User profile dan data management |

## 4. Application Shell

Komponen utama:

- `src/app/layout.tsx`
- `src/components/AppShell.tsx`
- `src/components/AppSidebar.tsx`
- `src/components/RoleProvider.tsx`
- `src/components/DataProvider.tsx`
- `src/components/ToastProvider.tsx`

Flow shell:

1. `layout.tsx` memasang provider global.
2. `RoleProvider` menyimpan role simulasi di `localStorage`.
3. `DataProvider` memuat data dari Supabase jika env tersedia.
4. `AppShell` menampilkan sidebar, header, logo, role selector, dan content slot.
5. `ToastProvider` menampilkan notifikasi create/update/delete.

## 5. Data Provider

File:

```text
src/components/DataProvider.tsx
```

Tanggung jawab:

- Load `bad_data_cases` dan `checklist_runs`.
- Fallback ke sample data lokal jika Supabase env belum tersedia.
- CRUD bad data cases.
- Save checklist run.
- Create case from checklist.
- Load/reset sample data.
- Write audit log ke Supabase.

Mode storage:

- `supabase`: jika `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` tersedia.
- `demo`: jika env tidak tersedia.

Catatan:

- Badge storage mode tidak lagi ditampilkan di header.
- Storage mode tetap dipakai internal untuk fallback data.

## 6. Supabase Schema

SQL tersedia di:

```text
supabase/schema.sql
supabase/seed.sql
```

Tables:

### `bad_data_cases`

Menyimpan register kasus bad data.

Kolom utama:

- `case_id`
- `created_date`
- `rm_name`
- `product`
- `cif`
- `customer_name`
- `phone_number`
- `issue_category`
- `source_system`
- `process_stage`
- `business_impact`
- `priority`
- `status`
- `assigned_pic`
- `target_resolution_date`
- `closed_date`
- `action_taken`
- `escalation_required`
- `escalation_date`
- `escalation_target`
- `evidence_note`
- `created_by`
- `updated_at`

### `checklist_runs`

Menyimpan hasil pre-screening.

Kolom utama:

- `run_date`
- `product`
- `rm_name`
- `cif`
- `phone_number`
- `normalized_phone`
- boolean checklist items
- `notes`
- `result_status`
- `created_case_id`

### `audit_logs`

Mencatat aktivitas create/update/delete/reset.

Kolom utama:

- `timestamp`
- `action`
- `entity_type`
- `entity_id`
- `performed_by`
- `old_value`
- `new_value`

## 7. RLS dan Security

Schema mengaktifkan RLS pada semua tabel.

MVP policy:

- Read/write policy dibuka untuk dummy data.
- Ini hanya untuk MVP dan bukan untuk data nasabah asli.

Batasan keamanan:

- Tidak ada integrasi ke BRISpot internal.
- Tidak ada CIF/nama/nomor HP asli.
- Tidak menggunakan service role key di frontend.
- Hanya anon public key Supabase yang digunakan di browser.

Untuk production sebenarnya:

- Tambahkan Supabase Auth.
- Implementasikan RLS berbasis user/role.
- Batasi delete/reset hanya untuk admin terotentikasi.
- Simpan role di server/auth claims, bukan localStorage.

## 8. Masking dan Validasi

File:

```text
src/lib/utils.ts
src/lib/validation.ts
```

Utility utama:

- `generateCaseId()`
- `maskCif()`
- `maskPhone()`
- `maskName()`
- `normalizePhone()`
- `calculateSlaDueDate()`
- `isOverdue()`
- `generateEscalationText()`
- `exportToExcel()`

Rules:

- CIF display: `******1234`.
- Phone display: `0812****7890`.
- Name display: masked per word.
- Phone prefix `62` dinormalisasi ke `0`.
- SLA due date:
  - Critical: +1 day.
  - High: +2 days.
  - Medium: +5 days.
  - Low: +7 days.

Zod schema:

- `caseFormSchema`
- `checklistSchema`

## 9. Page-Level Technical Notes

### Dashboard

File:

```text
src/app/dashboard/page.tsx
src/components/charts/DashboardCharts.tsx
src/lib/analytics.ts
```

Data source:

- `cases` dari `useData()`.

Analytics:

- `dashboardMetrics()`
- `countBy()`
- `monthlyTrend()`
- `slaOverdueDistribution()`

Output:

- KPI cards.
- Product summary.
- Recharts charts.

### Bad Data Register

File:

```text
src/app/register/page.tsx
src/components/CaseForm.tsx
```

Capabilities:

- Create case.
- Edit case.
- Close case.
- Delete case.
- Filter/search.
- Export filtered rows.

Validation:

- `validateCaseForm()`.
- SLA target auto-suggested in `CaseForm`.

Role behavior:

- Admin: create/edit/delete/export.
- RM: create/edit own RM-created cases.
- Viewer: blocked by `AccessGuard`.

### Checklist Pre-screening

File:

```text
src/app/checklist/page.tsx
src/components/ChecklistForm.tsx
```

Capabilities:

- Save checklist.
- Normalize phone.
- Detect failed critical items.
- Create bad data case from failed checklist.
- Export checklist history.

Important UI behavior:

- Result banner is hidden on initial page load.
- Result banner appears only after checklist interaction or valid process action.
- Banner resets after successful save/create.

### Escalation Generator

File:

```text
src/app/escalation/page.tsx
src/components/EscalationTemplate.tsx
src/lib/escalation.ts
```

Capabilities:

- Select case.
- Select escalation target.
- Generate Indonesian escalation template.
- Copy to clipboard.
- Mark case as escalated.

Mutation:

- `updateCase()` sets:
  - `status = "Escalated"`
  - `escalation_required = true`
  - `escalation_date`
  - `escalation_target`

### Reports

File:

```text
src/app/reports/page.tsx
src/lib/analytics.ts
src/lib/excel.ts
```

Capabilities:

- Filter by period.
- Summary by period.
- Status breakdown.
- Top issue categories.
- Top overdue cases.
- Cases by RM.
- Cases by product.
- Export workbook.

### Settings

File:

```text
src/app/settings/page.tsx
```

Capabilities:

- Display user profile.
- Download CSV template.
- Load sample data.
- Reset sample data.

Removed from content:

- Role selector card.
- Privacy warning card.
- Storage mode card.
- MVP wording in main settings content.

## 10. Excel Export

File:

```text
src/lib/excel.ts
```

Functions:

- `exportToExcel()`
- `exportWorkbook()`
- `downloadCsvTemplate()`

Export sources:

- Register filtered data.
- Checklist history.
- Reports summary workbook.

## 11. Deployment

### Cloudflare Workers Static Assets

Files:

```text
wrangler.jsonc
.node-version
next.config.js
```

Cloudflare settings:

```text
Build command: npm run build
Deploy command: npx wrangler deploy
Root directory: /
```

Env vars:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

`wrangler.jsonc` points Worker assets to:

```text
./out
```

### Vercel

Settings:

```text
Build command: npm run build
```

Env vars sama seperti Cloudflare.

## 12. Test and Verification

Commands:

```bash
npm run lint
npm run test
npm run build
```

Current verified behavior:

- Lint passes.
- Build passes.
- Supabase connection works when `.env.local` is configured.
- Static output deploys through Cloudflare Worker static assets.

## 13. Known MVP Limitations

- Role selector is UI simulation, not authentication.
- RLS policy is permissive for dummy data.
- No BRISpot internal integration.
- No file upload evidence.
- CSV import is not implemented; only template download is available.
- `xlsx` package has known npm audit advisories; app only exports generated dummy rows and does not parse uploaded Excel files.

## 14. Future Enhancements

- Supabase Auth.
- Real role-based authorization.
- Branch leader dashboard.
- SLA reminder notification.
- Email/Teams/WhatsApp escalation integration.
- Approval workflow.
- PDF report export.
- Real BRISpot integration through approved internal API.


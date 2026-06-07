"use client";

import { Database, Download, RefreshCcw, RotateCcw, ShieldAlert } from "lucide-react";
import { AccessGuard } from "@/components/AccessGuard";
import { useData } from "@/components/DataProvider";
import { useRole } from "@/components/RoleProvider";
import { ROLE_OPTIONS } from "@/types";
import { downloadCsvTemplate } from "@/lib/excel";

export default function SettingsPage() {
  const { role, setRole } = useRole();
  const { storageMode, loadSampleData, resetSampleData } = useData();

  return (
    <AccessGuard allowed={["Admin"]}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-bri-blue">
            Settings / Data Management
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Pengaturan MVP</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Kelola sample data, template CSV, dan role selector simulasi.
          </p>
        </div>

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <div className="flex gap-3">
            <ShieldAlert className="h-6 w-6 shrink-0" />
            <div>
              <h2 className="font-semibold">Privacy warning</h2>
              <p className="mt-1 text-sm leading-6">
                Gunakan data dummy. Jangan memasukkan data nasabah asli pada MVP ini. MVP tidak
                terhubung ke BRISpot atau sistem internal BRI mana pun.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-bri-blue" />
              <h2 className="text-base font-semibold text-slate-950">Storage Mode</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Mode saat ini:{" "}
              <span className="font-semibold text-slate-950">
                {storageMode === "supabase" ? "Supabase cloud database" : "Demo preview"}
              </span>
              . Untuk persistence deploy, isi NEXT_PUBLIC_SUPABASE_URL dan
              NEXT_PUBLIC_SUPABASE_ANON_KEY.
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-base font-semibold text-slate-950">Role Selector</h2>
            <p className="mt-2 text-sm text-slate-600">
              Simulasi role MVP tanpa login. Viewer hanya dapat mengakses dashboard dan reports.
            </p>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as typeof role)}
              className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-bri-blue focus:ring-2 focus:ring-blue-100"
            >
              {ROLE_OPTIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </section>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-base font-semibold text-slate-950">Data Management</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Fitur import CSV penuh belum diaktifkan pada MVP. Gunakan tombol template untuk
            standardisasi input, lalu input kasus melalui form register.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Download CSV Template
            </button>
            <button
              type="button"
              onClick={() => void loadSampleData(role)}
              className="inline-flex items-center gap-2 rounded-lg border border-bri-blue bg-white px-4 py-2 text-sm font-semibold text-bri-blue hover:bg-blue-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Load Sample Data
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reset semua data dummy di Supabase dan muat ulang sample?")) {
                  void resetSampleData(role);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Sample Data
            </button>
          </div>
        </section>
      </div>
    </AccessGuard>
  );
}

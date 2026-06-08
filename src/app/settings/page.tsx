"use client";

import { Download, RefreshCcw, RotateCcw, UserCircle } from "lucide-react";
import { AccessGuard } from "@/components/AccessGuard";
import { useData } from "@/components/DataProvider";
import { useRole } from "@/components/RoleProvider";
import { downloadCsvTemplate } from "@/lib/excel";

export default function SettingsPage() {
  const { role } = useRole();
  const { loadSampleData, resetSampleData } = useData();

  return (
    <AccessGuard allowed={["Admin"]}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-bri-blue">
            Settings / Data Management
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Settings</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Kelola profil pengguna dan data sample aplikasi.
          </p>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-bri-blue">
              <UserCircle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-950">User Profile</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                BRI Kantor Cabang Sudirman Semanggi
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">Admin Cabang</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">{role}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Unit
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">Consumer</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-base font-semibold text-slate-950">Data Management</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gunakan tombol template untuk standardisasi input, lalu input kasus melalui form
            register.
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

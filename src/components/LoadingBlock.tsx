import { Loader2 } from "lucide-react";

export function LoadingBlock({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-soft">
      <Loader2 className="mx-auto h-6 w-6 animate-spin text-bri-blue" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}

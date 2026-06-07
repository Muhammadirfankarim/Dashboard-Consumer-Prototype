"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toastInput: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, ...toastInput }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((item) => {
          const Icon =
            item.type === "success" ? CheckCircle2 : item.type === "error" ? XCircle : Info;
          return (
            <div
              key={item.id}
              className={cn(
                "rounded-lg border bg-white p-4 shadow-soft ring-1 ring-slate-100",
                item.type === "success" && "border-emerald-200",
                item.type === "error" && "border-red-200",
                item.type === "info" && "border-blue-200"
              )}
            >
              <div className="flex gap-3">
                <Icon
                  className={cn(
                    "mt-0.5 h-5 w-5",
                    item.type === "success" && "text-emerald-600",
                    item.type === "error" && "text-red-600",
                    item.type === "info" && "text-blue-600"
                  )}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  {item.message ? (
                    <p className="mt-1 text-sm leading-5 text-slate-600">{item.message}</p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

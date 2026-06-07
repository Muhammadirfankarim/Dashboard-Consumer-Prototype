import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { RoleProvider } from "@/components/RoleProvider";
import { DataProvider } from "@/components/DataProvider";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "BRISpot Bad Data Monitoring & Escalation Dashboard",
  description:
    "MVP dashboard monitoring bad data BRISpot untuk BRI Kantor Cabang Sudirman Semanggi."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ToastProvider>
          <RoleProvider>
            <DataProvider>
              <AppShell>{children}</AppShell>
            </DataProvider>
          </RoleProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

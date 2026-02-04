import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@packages/ui";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-lg">Admin Dashboard</div>
          <nav className="flex gap-4">
            <Link href="/admin/providers">
              <Button variant="ghost">Providers</Button>
            </Link>
            <Link href="/dashboard/surveys">
              <Button variant="ghost">Mission Feed</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

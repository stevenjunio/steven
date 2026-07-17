import isUserAdmin from "@/library/isUserAdmin";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}

async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isUserAdmin())) redirect("/login");
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-4">
          <Link href="/admin" className="font-semibold">Steven Admin</Link>
          <nav className="flex flex-1 flex-wrap gap-1 text-sm text-slate-600">
            <Link href="/admin/knowledge" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-950">Knowledge</Link>
            <Link href="/admin/agent" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-950">Private agent</Link>
          </nav>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-950">View site</Link>
          <a href="/auth/logout" className="text-sm text-slate-500 hover:text-slate-950">Sign out</a>
        </div>
      </header>
      {children}
    </div>
  );
}

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
    <div className="min-h-screen bg-[#f5f5f4] text-slate-950">
      <header className="h-[57px] border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-full max-w-5xl items-center gap-4 px-4 sm:px-5">
          <Link href="/admin/agent" className="font-semibold tracking-tight">My agent</Link>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Private</span>
          <nav className="ml-auto flex items-center gap-1 text-xs font-medium text-slate-500 sm:text-sm">
            <Link href="/ask" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950">Public chat</Link>
            <Link href="/" className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 sm:block">Portfolio</Link>
            <a href="/auth/logout" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950">Sign out</a>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

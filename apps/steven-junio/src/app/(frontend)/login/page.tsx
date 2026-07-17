import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { getAdminSubject } from "@/library/isUserAdmin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner login",
  description: "Private owner access for Steven Junio.",
  robots: { index: false, follow: false },
};

export default async function OwnerLoginPage() {
  const session = await auth0?.getSession();
  const subject = session?.user?.sub;
  const adminSubject = await getAdminSubject();

  if (adminSubject) redirect("/admin/agent");

  return (
    <main className="grid min-h-[calc(100dvh-68px)] place-items-center bg-slate-50 px-5 py-12 text-slate-950">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-950/5 sm:p-9">
        <div className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-white" aria-hidden="true">
          <LockIcon className="size-5" />
        </div>

        {subject ? (
          <>
            <p className="mt-6 text-sm font-semibold text-amber-700">Account not authorized</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Owner access</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              You signed in successfully, but this account is not on Steven&apos;s private owner allowlist.
            </p>
            <div className="mt-5 rounded-2xl bg-slate-100 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Auth0 subject</p>
              <code className="mt-2 block break-all text-xs text-slate-800">{subject}</code>
            </div>
            <a href="/auth/logout" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold transition hover:bg-slate-50">
              Sign out
            </a>
          </>
        ) : (
          <>
            <p className="mt-6 text-sm font-semibold text-blue-700">Steven only</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Owner access</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Sign in to open Steven&apos;s private agent and memory workspace. The chat remains unavailable to public visitors.
            </p>
            {auth0 ? (
              <a href="/auth/login?returnTo=/admin/agent" className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2">
                Continue to sign in
              </a>
            ) : (
              <p className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Owner sign-in is temporarily unavailable because authentication is not configured.
              </p>
            )}
          </>
        )}

        <Link href="/" className="mt-5 block text-center text-sm text-slate-500 hover:text-slate-950">
          Back to portfolio
        </Link>
      </section>
    </main>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="11" x="4" y="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

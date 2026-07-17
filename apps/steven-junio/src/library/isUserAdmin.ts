import { auth0 } from "@/lib/auth0";

export async function getAdminSubject() {
  if (!auth0) {
    return null;
  }

  const session = await auth0.getSession();
  const adminSubjects = new Set(
    (process.env.AUTH0_ADMIN_SUBS ?? "")
      .split(",")
      .map((subject) => subject.trim())
      .filter(Boolean),
  );

  return session?.user?.sub && adminSubjects.has(session.user.sub)
    ? session.user.sub
    : null;
}

export default async function isUserAdmin() {
  return Boolean(await getAdminSubject());
}

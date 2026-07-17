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
  const subject = session?.user?.sub;

  if (!subject) return null;
  return adminSubjects.has(subject) ? subject : null;
}

export default async function isUserAdmin() {
  return Boolean(await getAdminSubject());
}

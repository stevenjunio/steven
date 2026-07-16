import { auth0 } from "@/lib/auth0";

export default async function isUserAdmin() {
  if (!auth0) {
    return false;
  }

  const session = await auth0.getSession();
  const userIsAdmin = session?.user?.email === "steven.junio91@gmail.com";
  return userIsAdmin;
}

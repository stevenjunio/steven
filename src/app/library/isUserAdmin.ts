import { getSession } from "@auth0/nextjs-auth0";

export default async function isUserAdmin() {
  const session = await getSession();
  const userIsAdmin = session?.user.role
    ? JSON.parse(session?.user?.role?.includes("Admin"))
    : false;
  return userIsAdmin;
}

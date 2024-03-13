import { getSession } from "@auth0/nextjs-auth0";

export default async function isUserAdmin() {
  const session = await getSession();
  const userIsAdmin = session?.user?.email === "steven.junio91@gmail.com";
  return userIsAdmin;
}

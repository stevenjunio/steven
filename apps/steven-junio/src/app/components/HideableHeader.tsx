import NavItem from "./NavItem";
import Link from "next/link";
// app/my-api/route.js
import { getSession } from "@auth0/nextjs-auth0";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";

const navMenu = [
  { title: "Contact", link: "mailto: steven.junio91@gmail.com" },
];

export default async function HideableHeader() {
  const session = await getSession();
  const user = session?.user;
  return (
    <header
      className={`sm:w-full bg-foreground py-4 text-white text-neutral sticky top-0 z-10 shadow-lg transition-all duration-300 `}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-secondary">
          <Link href={"/"}>Steven Junio</Link>
        </h1>
        <nav className="hidden sm:block" id="main-nav">
          <ul className="flex gap-4 text-xl">
            {navMenu.map((item) => (
              <NavItem item={item} key={item.title} />
            ))}
            <li>
              {user ? (
                <UserMenu />
              ) : (
                <Link href="/api/auth/login">
                  <UserMenu />
                </Link>
              )}
            </li>
          </ul>
        </nav>
        <button
          type="button"
          className="sm:hidden text-neutral hover:text-primary focus:outline-none"
          title="Menu"
        ></button>
        <MobileMenu />
      </div>
    </header>
  );
}

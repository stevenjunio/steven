import NavItem from "./NavItem";
import Link from "next/link";
// app/my-api/route.js
import { getSession } from "@auth0/nextjs-auth0";
import UserMenu from "./UserMenu";

const navMenu = [
  { title: "Home", link: "/" },
  { title: "Blog", link: "/blog" },
  { title: "Projects", link: "/projects" },
  { title: "Contact", link: "/contact" },
];

export default async function HideableHeader() {
  const session = await getSession();
  const user = session?.user;
  return (
    <header
      className={`sm:w-full bg-foreground text-white sm:py-4 text-neutral sticky top-0 z-10 shadow-lg transition-all duration-300 `}
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
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

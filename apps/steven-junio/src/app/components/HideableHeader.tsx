import isUserAdmin from "../library/isUserAdmin";
import NavItem from "./NavItem";
import Link from "next/link";
// app/my-api/route.js
import { getSession } from "@auth0/nextjs-auth0";
import Image from "next/image";

const navMenu = [
  { title: "Home", link: "/" },
  { title: "Blog", link: "/blog" },
  { title: "Projects", link: "/projects" },
  { title: "Contact", link: "/contact" },
];

export default async function HideableHeader() {
  return (
    <header
      className={`sm:w-full bg-neutral-800 text-neutral-50 sm:py-4 text-neutral sticky top-0 z-10 shadow-lg transition-all duration-300 `}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">
          <Link href={"/"}>Steven Junio</Link>
        </h1>
        <nav className="hidden sm:block" id="main-nav">
          <ul className="flex gap-4 text-xl">
            {navMenu.map((item) => (
              <NavItem item={item} key={item.title} />
            ))}
            <li>
              <Link href="/api/auth/login">
                <div className="flex items-center cursor-pointer">
                  <Image
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff"><path d="M17.5 14.33c0 2.34-2.91 4.24-6.5 4.24s-6.5-1.9-6.5-4.24C4.5 11.46 8.91 9 11 9c2.09 0 6.5 2.46 6.5 5.33zM11 5.62c-2.07 0-3.76 1.67-3.76 3.75 0 2.07 1.69 3.75 3.76 3.75s3.76-1.68 3.76-3.75c0-2.08-1.69-3.75-3.76-3.75z" /></svg>'
                    )}`}
                    alt="Profile Icon"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                </div>
              </Link>
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

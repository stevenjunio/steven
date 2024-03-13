"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { useState } from "react";

function UserMenuDropdown({ isVisible }: { isVisible: boolean }) {
  return (
    <div
      className={`w-full fixed left-0 top-[68px] h-full bg-foreground p-4 border-t-2 `}
    >
      <nav className="">
        <ol className="flex flex-col gap-2 text-2xl  h-full">
          <li className="h-11 hover:underline">
            <Link href={"/"}>Home</Link>
          </li>
          <li className="h-11 hover:underline">
            <Link href={"/blog"}>Blog</Link>
          </li>
          <li className="h-11 hover:underline">
            <Link href={"/projects"}>Projects</Link>
          </li>
          <li className="h-11 hover:underline">
            <Link href={"/contact"}>Contact</Link>
          </li>
          {useUser().user?.email == "steven.junio91@gmail.com" ? (
            <li className="h-11 hover:underline">
              <Link href={"/admin"}>Admin</Link>
            </li>
          ) : (
            false
          )}
        </ol>
      </nav>
    </div>
  );
}

export default function MobileMenu() {
  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => setMenuVisible(!menuVisible);

  return (
    <div className="sm:hidden">
      <button
        title="mobile menu"
        type="button"
        id="mobile-menu"
        onClick={toggleMenu}
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
      {menuVisible && <UserMenuDropdown isVisible={menuVisible} />}
    </div>
  );
}

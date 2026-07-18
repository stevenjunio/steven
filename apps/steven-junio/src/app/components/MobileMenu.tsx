"use client";
import Link from "next/link";
import { useState } from "react";

function UserMenuDropdown({
  isOwner,
  onNavigate,
}: {
  isOwner: boolean;
  onNavigate: () => void;
}) {
  return (
    <div
      id="mobile-navigation"
      className="fixed left-0 top-[68px] h-[calc(100dvh-68px)] w-full border-t-2 bg-foreground p-4"
    >
      <nav className="h-full">
        <ol className="flex h-full flex-col gap-2 text-2xl">
          <li className="h-11 hover:underline">
            <Link href={"/"} onClick={onNavigate}>Home</Link>
          </li>

          <li className="h-11 hover:underline">
            <Link href={"/projects"} onClick={onNavigate}>Projects</Link>
          </li>
          <li className="h-11 hover:underline">
            <Link href={"/contact"} onClick={onNavigate}>Contact</Link>
          </li>
          {isOwner && (
            <li className="h-11 hover:underline">
              <Link href={"/chat"} onClick={onNavigate}>Chat</Link>
            </li>
          )}
          <li className="mt-auto border-t border-white/15 pt-4 text-base text-white/65 hover:text-white">
            <Link href="/login" onClick={onNavigate} className="flex min-h-11 items-center gap-2">
              <LockIcon className="size-4" />
              Owner login
            </Link>
          </li>
        </ol>
      </nav>
    </div>
  );
}

export default function MobileMenu({ isOwner }: { isOwner: boolean }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => setMenuVisible(!menuVisible);

  return (
    <div className="sm:hidden">
      <button
        aria-controls="mobile-navigation"
        aria-expanded={menuVisible}
        aria-label={menuVisible ? "Close navigation menu" : "Open navigation menu"}
        title={menuVisible ? "Close menu" : "Open menu"}
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
      {menuVisible && (
        <UserMenuDropdown
          isOwner={isOwner}
          onNavigate={() => setMenuVisible(false)}
        />
      )}
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="16" height="11" x="4" y="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

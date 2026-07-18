import NavItem from "./NavItem";
import Link from "next/link";
import MobileMenu from "./MobileMenu";

const navMenu = [
  { title: "Chat", link: "/chat" },
  { title: "Contact", link: "/contact" },
];

export default async function HideableHeader() {
  return (
    <header
      className={`sm:w-full bg-foreground py-4 text-white text-neutral sticky top-0 z-10 shadow-lg transition-all duration-300 `}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-3xl font-bold text-secondary">
          <Link href={"/"}>Steven Junio</Link>
        </div>
        <nav className="hidden sm:block" id="main-nav">
          <ul className="flex items-center gap-4 text-xl">
            {navMenu.map((item) => (
              <NavItem item={item} key={item.title} />
            ))}
            <li>
              <Link
                href="/login"
                aria-label="Owner login"
                title="Owner login"
                className="grid size-10 place-items-center rounded-xl text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <LockIcon className="size-4" />
              </Link>
            </li>
          </ul>
        </nav>
        <MobileMenu />
      </div>
    </header>
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

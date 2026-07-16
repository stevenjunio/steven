import NavItem from "./NavItem";
import Link from "next/link";
import MobileMenu from "./MobileMenu";

const navMenu = [{ title: "Contact", link: "/contact" }];

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
          <ul className="flex gap-4 text-xl">
            {navMenu.map((item) => (
              <NavItem item={item} key={item.title} />
            ))}
            {/* <li>
              {user ? (
                <UserMenu />
              ) : (
                <Link href="/api/auth/login">
                  <UserMenu />
                </Link>
              )}
            </li> */}
          </ul>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}

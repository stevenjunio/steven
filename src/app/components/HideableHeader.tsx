"use client";

import { useEffect, useRef, useState } from "react";
import NavItem from "./NavItem";
const navMenu = [
  {
    title: "Home",
    link: "/",
  },
  {
    title: "Blog",
    link: "/blog",
  },
  {
    title: "Projects",
    link: "/projects",
  },
  {
    title: "Contact",
    link: "/contact",
  },
];
export default function HideableHeader() {
  const [headerHidden, setHeaderHidden] = useState<boolean>(false);

  const header = useRef<null | HTMLElement>(null);

  //   useEffect(() => {
  //     const handleScroll = () => {
  //       const headerHeight = header.current?.clientHeight;
  //       if (window.scrollY > 20 && headerHidden === false) {
  //         // Or use 120 if that's the intended threshold
  //         setHeaderHidden(true);
  //       } else if (window.scrollY < 20 && headerHidden === true) {
  //         setHeaderHidden(false);
  //       }
  //     };

  //     window.addEventListener("scroll", handleScroll);
  //     return () => {
  //       window.removeEventListener("scroll", handleScroll);
  //     };
  //   }, []);

  return (
    <header
      ref={header}
      className={
        headerHidden
          ? `invisible`
          : `sm:w-full sm:flex sm:flex-col sm:bg-slate-800 sm:py-4 text-white sticky top-0`
      }
    >
      <h1 className="text-3xl w-fit m-auto">Steven Junio</h1>
      <hr className="w-[calc(100%-40px)] m-auto my-2" />
      <nav className="" id="main-nav">
        <ul className="flex justify-center gap-4 text-xl mt-1">
          {navMenu.map((item) => (
            <NavItem item={item} key={item.title} />
          ))}
        </ul>
      </nav>
    </header>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemProps {
  item: {
    title: string;
    link: string;
  };
}

export default function NavItem({ item }: NavItemProps) {
  const path = usePathname();
  return (
    <li key={item.title}>
      <Link
        href={item.link}
        className={
          path === item.link
            ? "p-2 hover:bg-slate-900 rounded-md"
            : "p-2 hover:bg-slate-900 rounded-md"
        }
      >
        {item.title}
      </Link>
    </li>
  );
}

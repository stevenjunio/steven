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
    <li
      className={
        path === item.link
          ? "bg-slate-600 p-2 rounded-md"
          : "p-2 hover:bg-slate-900 rounded-md"
      }
      key={item.title}
    >
      <Link href={item.link}>{item.title}</Link>
    </li>
  );
}

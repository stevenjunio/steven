"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function UserMenuDropdown() {
  return (
    <div className="absolute p-4 right-2 top-11 bg-foreground rounded transition">
      <Link href={"/admin"}>Admin</Link>
    </div>
  );
}

export default function UserMenu() {
  const [menuVisible, setMenuVisible] = useState(false);
  const user = useUser().user;
  function handleMenuClick() {
    if (user?.email === "steven.junio91@gmail.com")
      setMenuVisible(!menuVisible);
  }
  return (
    <>
      <div className="relative flex items-center cursor-pointer">
        <Image
          src={`data:image/svg+xml;utf8,${encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff"><path d="M17.5 14.33c0 2.34-2.91 4.24-6.5 4.24s-6.5-1.9-6.5-4.24C4.5 11.46 8.91 9 11 9c2.09 0 6.5 2.46 6.5 5.33zM11 5.62c-2.07 0-3.76 1.67-3.76 3.75 0 2.07 1.69 3.75 3.76 3.75s3.76-1.68 3.76-3.75c0-2.08-1.69-3.75-3.76-3.75z" /></svg>'
          )}`}
          alt="Profile Icon"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full mr-2"
          onClick={handleMenuClick}
        />{" "}
        {menuVisible && <UserMenuDropdown />}
      </div>
    </>
  );
}

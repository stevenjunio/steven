import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

import BlogPost from "./components/BlogPost";
import Link from "next/link";
import isUserAdmin from "../library/isUserAdmin";
import { getSession } from "@auth0/nextjs-auth0";

export const revalidate = 120;

export const runtime = "nodejs";

export default async function Blog() {
  const prisma = new PrismaClient().$extends(withAccelerate());
  await isUserAdmin().then((res) => {
    console.log("isUserAdmin", res);
  });
  await getSession().then((res) => {
    console.log("getSession", res);
  });

  const posts = await prisma.post.findMany({
    select: {
      title: true,
      content: true,
      id: true,
      slug: true,
    },

    orderBy: {
      createdAt: "desc",
    },
    cacheStrategy: { ttl: 60 },
  });

  return (
    <div className="flex flex-col container max-w-screen-xl mx-auto gap-4">
      {(await isUserAdmin()) && (
        <Link href={"/blog/post"} className="self-end w-fit">
          Create
        </Link>
      )}

      {posts.map((post) => {
        return <BlogPost post={post} key={post.id} />;
      })}
    </div>
  );
}

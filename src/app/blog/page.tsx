import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

import BlogPost from "./components/BlogPost";
import Link from "next/link";

export const dynamic = "auto";
export const dynamicParams = true;
export const revalidate = 120;
export const runtime = "nodej";

export default async function Blog() {
  const prisma = new PrismaClient().$extends(withAccelerate());

  const posts = await prisma.post.findMany({
    select: {
      title: true,
      content: true,
      id: true,
    },

    orderBy: {
      createdAt: "desc",
    },
    cacheStrategy: { ttl: 60 },
  });
  console.log(posts);

  return (
    <div className="flex flex-col container max-w-screen-xl mx-auto gap-4">
      <Link href={"/blog/post"} className="self-end w-fit">
        Create
      </Link>
      {posts.map((post) => {
        return <BlogPost post={post} key={post.id} />;
      })}
    </div>
  );
}

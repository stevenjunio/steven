import Link from "next/link";
import BlogPost from "../components/BlogPost";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

interface BlogProps {
  params: {
    slug: string;
  };
}
export default async function Blog({ params }: BlogProps) {
  const prisma = new PrismaClient().$extends(withAccelerate());
  const post = await prisma.post.findUnique({
    where: {
      slug: params.slug,
    },
  });
  return (
    <div className="flex flex-col container max-w-screen-xl mx-auto gap-4">
      {
        <main>
          <h1 className="text-4xl mb-2">{post?.title}</h1>
          <div
            id="blog-content"
            dangerouslySetInnerHTML={{ __html: post?.content || "" }}
          ></div>
        </main>
      }
    </div>
  );
}
export const revalidate = 120;
export const runtime = "nodejs";

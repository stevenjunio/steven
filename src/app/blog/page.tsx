import { PrismaClient } from "@prisma/client";
import BlogPost from "./components/BlogPost";
import Link from "next/link";

export default async function Blog() {
  const prisma = new PrismaClient();

  const posts = await prisma.post.findMany({
    select: {
      title: true,
      published: true,
    },
  });
  console.log(posts);

  return (
    <div className="flex flex-col">
      <Link href={"/blog/post"} className="self-end w-fit">
        Create
      </Link>
      <BlogPost />
    </div>
  );
}

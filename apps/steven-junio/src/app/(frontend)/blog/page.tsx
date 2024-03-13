import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import BlogPost from "./components/BlogPost";

export const revalidate = 120;

export default async function Blog() {
  const prisma = new PrismaClient().$extends(withAccelerate());

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
    cacheStrategy: { ttl: 5 },
  });

  return (
    <div className="flex flex-col container max-w-screen-xl mx-auto gap-4">
      {posts.map((post) => {
        return <BlogPost post={post} key={post.id} />;
      })}
    </div>
  );
}

import BlogPost from "./components/BlogPost";
import { getPrisma } from "@/library/prisma";

export const dynamic = "force-dynamic";

export default async function Blog() {
  const prisma = getPrisma();

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

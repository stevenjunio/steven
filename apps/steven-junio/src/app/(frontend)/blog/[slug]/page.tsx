import { getPrisma } from "@/library/prisma";

interface BlogProps {
  params: Promise<{
    slug: string;
  }>;
}
export default async function Blog({ params }: BlogProps) {
  const { slug } = await params;
  const prisma = getPrisma();
  const post = await prisma.post.findFirst({
    where: {
      slug,
      published: true,
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
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { Post } from "@prisma/client";
import Link from "next/link";

interface Props {
  post: Partial<Post>;
}

export default function BlogPost({ post }: Props) {
  const truncatedContent = post.content
    ?.replaceAll(/<\[^>]*>?/gm, "")
    .slice(0, 440);

  return (
    <div className="bg-secondary text-secondary rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-primary mb-2">{post.title}</h1>
        <div
          className="line-clamp-4 text-primary leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: truncatedContent || "" }}
        ></div>
        <div className="flex justify-end">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-block bg-primary text-neutral-50 hover:bg-accent-2 px-6 py-3 rounded-full transition-colors duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}

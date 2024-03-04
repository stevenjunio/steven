import { Post } from "@prisma/client";

interface Props {
  post: Partial<Post>;
}

export default function BlogPost({ post }: Props) {
  const truncatedContent = post.content
    ?.replaceAll(/<[^>]*>?/gm, "")
    .slice(0, 340);
  //remove the html tags from the content
  console.log(truncatedContent);
  return (
    <div className="bg-white text-black  rounded-md border-solid border-black border p-4 round max-h-52">
      <h1 className="text-xl font-bold">{post.title}</h1>
      <div
        className=" line-clamp-2"
        dangerouslySetInnerHTML={{
          __html: truncatedContent || "",
        }}
      ></div>
    </div>
  );
}

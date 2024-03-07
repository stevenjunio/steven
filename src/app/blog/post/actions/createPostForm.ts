"use server";

import { PrismaClient } from "@prisma/client";

export async function createBlogPost(formData: FormData) {
  const title = formData.get("title");
  const content = formData.get("content");
  const slug = formData.get("slug");
  console.log(`running on the server`, title, content);
  const prisma = new PrismaClient();

  const newPost = await prisma.post.create({
    data: {
      title: title as string,
      content: content as string,
      slug: slug as string,
    },
  });
  prisma.$disconnect();
  return {
    message: "Post created successfully",
  };
}

"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

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
  revalidatePath("/blog", "page");
  redirect("/blog");
  return {
    message: "Post created successfully",
  };
}

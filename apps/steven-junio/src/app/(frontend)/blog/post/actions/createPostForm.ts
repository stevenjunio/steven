"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/library/prisma";
import isUserAdmin from "@/library/isUserAdmin";

export async function createBlogPost(formData: FormData) {
  if (!(await isUserAdmin())) {
    redirect("/auth/login?returnTo=/blog/post");
  }

  const title = formData.get("title");
  const content = formData.get("content");
  const slug = formData.get("slug");
  const prisma = getPrisma();

  await prisma.post.create({
    data: {
      title: title as string,
      content: content as string,
      slug: slug as string,
    },
  });
  revalidatePath("/blog", "page");
  redirect("/blog");
}

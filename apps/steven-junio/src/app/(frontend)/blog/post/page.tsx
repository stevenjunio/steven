import SubmitBlogPostForm from "./components/SubmitBlogPostForm";
import isUserAdmin from "@/library/isUserAdmin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CreateBlogPostPage() {
  if (!(await isUserAdmin())) {
    redirect("/auth/login?returnTo=/blog/post");
  }

  return (
    <div className="border-solid border-black border p-4 round">
      <SubmitBlogPostForm />
    </div>
  );
}

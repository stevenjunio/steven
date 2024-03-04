"use client";

import { useFormStatus } from "react-dom";
import { createBlogPost } from "../actions/createPostForm";
import { TinyMceRichTextEditor } from "../TinyMceRichTextEditor";
import SubmitBlogPostButton from "./SubmitBlogButton";

export default function SubmitBlogPostForm() {
  const { pending } = useFormStatus();

  return (
    <form
      action={createBlogPost}
      className={pending ? "bg-red-500" : "flex flex-col gap-4 "}
    >
      <input
        type="text"
        name="title"
        placeholder="Blog title"
        className="p-4 text-black"
        id="title"
      />
      <TinyMceRichTextEditor name="content" />
      <SubmitBlogPostButton />
    </form>
  );
}

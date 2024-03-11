"use client";

import { createBlogPost } from "../actions/createPostForm";
import { TinyMceRichTextEditor } from "../TinyMceRichTextEditor";
import SubmitBlogPostButton from "./SubmitBlogButton";

export default function SubmitBlogPostForm() {
  return (
    <form
      action={createBlogPost}
      className={"flex flex-col gap-4 bg-background"}
    >
      <input
        required
        type="text"
        name="title"
        placeholder="Blog title"
        className="p-4 text-primary bg-input border-border "
        id="title"
      />
      <input
        required
        type="text"
        name="slug"
        placeholder="Blog slug"
        className="p-4  text-primary bg-input border-border"
        id="slug"
      />

      <TinyMceRichTextEditor name="content" />
      <SubmitBlogPostButton />
    </form>
  );
}

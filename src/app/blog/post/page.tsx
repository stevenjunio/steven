"use client";

import { TinyMceRichTextEditor } from "./TinyMceRichTextEditor";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import SubmitBlogPostForm from "./components/SubmitBlogPostForm";

export default function CreateBlogPostPage() {
  return (
    <div className="bg-gray-300 border-solid border-black border p-4 round">
      <SubmitBlogPostForm />
    </div>
  );
}

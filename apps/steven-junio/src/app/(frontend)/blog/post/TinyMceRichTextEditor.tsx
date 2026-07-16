"use client";

import { Editor } from "@tinymce/tinymce-react";
export type TinyMceRichTextEditorProps = {
  name: string;
};
export function TinyMceRichTextEditor({ name }: TinyMceRichTextEditorProps) {
  return (
    <div className="min-h-[500px] bg-input rounded-lg">
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
        textareaName={name}
        init={{
          placeholder: "Blog content",
          height: 500,
          menubar: true,
          content_style:
            "body.mce-content-body { background-color: rgb(226 232 240); padding: 3px; color: #0f172a; }",
          plugins: ["link", "autolink", "code"],
          menu: {
            link: { title: "Insert link", items: "link" },
          },
          toolbar:
            "undo redo  |" +
            "bold italic backcolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | link openlink unlink | code",
        }}
      />
    </div>
  );
}

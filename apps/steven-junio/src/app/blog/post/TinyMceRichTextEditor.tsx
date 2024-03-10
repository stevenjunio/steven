"use client";

import { useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
export type TinyMceRichTextEditorProps = {
  name: string;
};
export function TinyMceRichTextEditor({ name }: TinyMceRichTextEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<Editor | null>(null);

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="min-h-[500px] bg-white rounded-lg">
          <Editor
            apiKey="ti8pgdb1l3yhdpxt0kchnalnik3ruxmn4bcaux07mq3sf89y"
            ref={editorRef}
            textareaName="content"
            init={{
              placeholder: "Blog content",
              height: 500,
              menubar: true,
              plugins: ["link", "autolink"],
              menu: {
                link: { title: "Insert link", items: "link" },
              },
              toolbar:
                "undo redo  |" +
                "bold italic backcolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | link openlink unlink ",
            }}
          />
        </div>
      )}
    </>
  );
}

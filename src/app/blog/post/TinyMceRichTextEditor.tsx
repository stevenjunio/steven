"use client";

import { useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { TinyMCE } from "tinymce";
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
              menubar: false,
              plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table paste code help wordcount",
              ],
              toolbar:
                "undo redo | formatselect | " +
                "bold italic backcolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | help",
            }}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log(editorRef.current?.editor);
            }}
          >
            get content
          </button>
        </div>
      )}
    </>
  );
}

import { TinyMceRichTextEditor } from "./TinyMceRichTextEditor";

export default function createBlogPostPage() {
  return (
    <div className="bg-gray-300 border-solid border-black border p-4 round">
      <form action="" className="flex flex-col gap-4">
        <input type="text" placeholder="Blog title" className="p-4" />
        <textarea placeholder="Blog content" className="p-4"></textarea>
        <TinyMceRichTextEditor />
        <button className="w-fit p-4 rounded-md self-end bg-blue-800 text-white">
          Publish
        </button>
      </form>
    </div>
  );
}

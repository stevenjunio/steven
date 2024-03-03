import { useFormStatus } from "react-dom";

export default function SubmitBlogPostButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={"w-fit p-4 rounded-md self-end bg-blue-800 text-white"}
      disabled={pending}
    >
      Publish
    </button>
  );
}

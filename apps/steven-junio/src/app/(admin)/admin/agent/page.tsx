import { redirect } from "next/navigation";

export default function PrivateAgentPage() {
  redirect("/chat");
}

import Image from "next/image";
import HideableHeader from "./global-components/HideableHeader";

export default function Home() {
  return (
    <>
      <HideableHeader />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div>hello home</div>
      </main>
    </>
  );
}

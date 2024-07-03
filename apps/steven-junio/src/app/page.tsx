import Image from "next/image";
import HideableHeader from "./components/HideableHeader";

export default function Home() {
  return (
    <>
      <HideableHeader />
      <main className="py-2">
        <div className="container flex flex-col items-center justify-center h-[calc(100vh-84px)] ">
          <h1 className="w-fit text-5xl">{`Hello, I'm Steven
        `}</h1>
          <h2 className="w-fit text-3xl ">
            I develop performant, scaleable software
          </h2>
        </div>
      </main>
    </>
  );
}

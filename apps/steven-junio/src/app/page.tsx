import Image from "next/image";
import HideableHeader from "./components/HideableHeader";
import TimeOfDayScene from "@/components/ui/TimeOfDayScene";

export default function Home() {
  return (
    <>
      <HideableHeader />
      <main className="">
        {/* Parent div with relative positioning */}
        <div className="relative container flex flex-col items-center justify-center h-[calc(100vh-84px)]">
          {/* TimeOfDayScene with absolute positioning */}
          <div className="absolute top-0 right-0 bottom-0 left-0 z-0">
            <TimeOfDayScene />
          </div>

          {/* Hero content with higher z-index */}
          <div className="z-10">
            <h1 className="w-fit text-5xl">{`Hello, I'm Steven`}</h1>
            <h2 className="w-fit text-3xl">
              I develop performant, scalable software
            </h2>
          </div>
        </div>
      </main>
    </>
  );
}

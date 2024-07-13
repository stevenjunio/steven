import { Button } from "@/components/ui/button";
import HideableHeader from "./components/HideableHeader";
import TimeOfDayScene from "./components/TimeOfDayScene";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className="">
        {/* Parent div with relative positioning */}
        <div className="relative  flex flex-col items-center justify-center h-[calc(100vh)] w-screen">
          {/* TimeOfDayScene with absolute positioning */}
          <div className="absolute top-0 right-0 bottom-0 left-0 z-0">
            <TimeOfDayScene />
          </div>

          {/* Hero content with higher z-index */}
          <div className="z-10 px-6 items-center flex flex-col">
            <h1 className="w-fit text-5xl font-sans inset-0 bg-black bg-opacity-30 backdrop-blur-sm rounded p-3 text-white tracking-wide ">{`Hello, I'm Steven`}</h1>
            <h2 className="w-fit text-2xl bg-black bg-opacity-30 p-3 rounded text-white mt-3">
              I develop performant, scalable software
            </h2>
            {/* Buttons container */}
            <div className="flex space-x-4 mt-4 justify-center">
              <Link href="/projects">
                <Button variant={"default"}>View Projects</Button>
              </Link>
              <Link href={"/contact"}>
                <Button variant={"secondary"}>Contact Me</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

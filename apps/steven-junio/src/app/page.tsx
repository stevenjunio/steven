import { Button } from "@/components/ui/button";
import TimeOfDayScene from "./components/TimeOfDayScene";
import Link from "next/link";
import gitHubIcon from "@/app/icons/github.svg"; // Adjust the path as necessary

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
              A full-stack software developer developer
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
          <div className="absolute bottom-4 w-full flex justify-center space-x-6">
            <Link href="https://github.com/stevenjunio" target="_blank">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="50"
                height="50"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#000"
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
            </Link>
            <Link
              href="https://www.linkedin.com/in/stevenjunio"
              target="_blank"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="50"
                height="50"
                viewBox="0 0 50 50"
              >
                <path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z"></path>
              </svg>
            </Link>
            <Link
              href="https://docs.google.com/document/d/18WPd2-z2g-_XGxwCSjEXWcHD5a_Hhbvl/edit?usp=sharing&ouid=116200925914091731929&rtpof=true&sd=true"
              target="_blank"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                stroke-linecap="round"
                stroke-linejoin="round"
                width="50"
                height="50"
                stroke-width="2"
              >
                <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                <path d="M9 17h6"></path>
                <path d="M9 13h6"></path>
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

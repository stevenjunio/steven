import { Button } from "@/components/ui/button";
import TimeOfDayScene from "./components/TimeOfDayScene";
import Link from "next/link";

const professionalLinks = [
  {
    label: "GitHub",
    href: "https://github.com/stevenjunio",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-current">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.72-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.8c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.3c0 .32.19.69.8.58A12 12 0 0 0 12 0Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/stevenjunio",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-current">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.42v1.57h.05a3.75 3.75 0 0 1 3.38-1.86c3.61 0 4.28 2.38 4.28 5.47v6.29ZM5.32 7.41a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.04H3.54V8.98H7.1v11.47ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
      </svg>
    ),
  },
  {
    label: "Résumé",
    href: "https://docs.google.com/document/d/1e0e0JipJCtlAUycl0ip2qKepGNW-EITz/edit?usp=sharing&ouid=116200925914091731929&rtpof=true&sd=true",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4 fill-none stroke-current"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
        <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    ),
  },
] as const;

export default function Home() {
  return (
    <>
      <main className="">
        {/* Parent div with relative positioning */}
        <div className="relative flex h-screen min-h-svh w-full flex-col items-center justify-center overflow-hidden h-dvh">
          {/* TimeOfDayScene with absolute positioning */}
          <div className="absolute top-0 right-0 bottom-0 left-0 z-0">
            <TimeOfDayScene />
          </div>

          {/* Hero content with higher z-index */}
          <div
            data-portfolio-hero
            className="z-10 flex -translate-y-20 flex-col items-center px-6 sm:translate-y-0"
          >
            <h1 className="inset-0 w-fit rounded bg-black bg-opacity-30 p-3 text-center font-sans text-4xl tracking-wide text-white backdrop-blur-sm sm:text-5xl">{`Hello, I'm Steven`}</h1>
            <h2 className="mt-3 w-fit whitespace-nowrap rounded bg-black bg-opacity-30 p-3 text-center text-lg text-white sm:text-2xl">
              I build software from idea to launch.
            </h2>
            {/* Buttons container */}
            <div className="flex space-x-4 mt-4 justify-center">
              <Button asChild variant="default">
                <Link href="/projects">View Projects</Link>
              </Button>

              <Button asChild variant="secondary">
                <Link href="/contact">Contact Me</Link>
              </Button>
            </div>
          </div>
          <nav
            aria-label="Professional links"
            className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/15 bg-slate-950/35 p-1.5 text-white/80 shadow-lg shadow-black/10 backdrop-blur-md"
          >
            {professionalLinks.map(({ label, href, icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium tracking-wide transition-colors hover:bg-white/15 hover:text-white focus-visible:bg-white/15 focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:px-3 sm:text-sm"
              >
                {icon}
                <span>{label}</span>
              </Link>
            ))}
            <span className="mx-0.5 h-6 w-px bg-white/15" aria-hidden="true" />
            <Link
              href="/login"
              aria-label="Owner login"
              title="Owner login"
              className="flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium tracking-wide text-white/60 transition-colors hover:bg-white/15 hover:text-white focus-visible:bg-white/15 focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:px-3 sm:text-sm"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
                <rect width="16" height="11" x="4" y="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <span>Login</span>
            </Link>
          </nav>
        </div>
      </main>
    </>
  );
}

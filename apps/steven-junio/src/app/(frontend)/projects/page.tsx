import { Card, Inset, Text, Flex, Box, Heading } from "@radix-ui/themes";
import Image from "next/image";
import { ChevronRight, CirclePlay } from "lucide-react";
import Link from "next/link";
import { projects } from "../../../../data/projects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Steven Junio's projects",
  alternates: {
    canonical: "/projects",
  },
};

type Project = (typeof projects)[number];

const featuredProjects = projects
  .filter((project) => project.importance >= 9)
  .toSorted((a, b) => b.importance - a.importance);

const earlierProjects = projects
  .filter((project) => project.importance < 9)
  .toSorted((a, b) => b.importance - a.importance);

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block h-full"
    >
      <Card className="h-full cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <Inset clip="padding-box" side="top" pb="current">
          {project.video ? (
            <div className="flex h-48 items-center justify-center bg-slate-900 text-white">
              <CirclePlay aria-hidden="true" size={42} strokeWidth={1.5} />
              <span className="sr-only">Project video available</span>
            </div>
          ) : (
            <Image
              className="h-48 w-full object-cover"
              src={project.image}
              alt={project.title}
              width={400}
              height={300}
            />
          )}
        </Inset>
        <Box p="4">
          <Flex justify="between" align="center">
            <Text size="5" weight="bold">
              {project.title}
            </Text>
            <ChevronRight
              className="text-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-700"
              size={20}
            />
          </Flex>
          <Text size="2" color="gray" className="mt-2 line-clamp-2">
            {project.description}
          </Text>
          <Text
            size="2"
            className="mt-4 text-blue-500 group-hover:underline"
          >
            View Project Details
          </Text>
        </Box>
      </Card>
    </Link>
  );
}

function ProjectGrid({ items }: { items: Project[] }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((project) => (
        <ProjectCard project={project} key={project.slug} />
      ))}
    </div>
  );
}

export default function ProjectPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Heading as="h1" size="8">
        Selected Work
      </Heading>
      <div id="projects">
        <ProjectGrid items={featuredProjects} />
      </div>

      <section className="mt-14" aria-labelledby="earlier-work">
        <Heading as="h2" size="6" id="earlier-work">
          Earlier Work & Experiments
        </Heading>
        <ProjectGrid items={earlierProjects} />
      </section>
    </main>
  );
}

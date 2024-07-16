import { Card, Inset, Text, Flex, Box } from "@radix-ui/themes";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { projects } from "../../../../data/projects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects - Steven Junio",
  description: "Steven Junio's projects",
};

export default function ProjectPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Text size="8">My Projects</Text>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
        id="projects"
      >
        {projects.map((project) => (
          <Link href={`/projects/${project.slug}`} key={project.slug}>
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
              <Inset clip="padding-box" side="top" pb="current">
                {project.video ? (
                  <video
                    className="h-[192px]"
                    loop
                    autoPlay={true}
                    controls={false}
                    muted
                    playsInline
                    height={300}
                    width={400}
                  >
                    <source src={project.video} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    className="w-full h-48 object-cover"
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
                    className="text-gray-500 group-hover:text-gray-700"
                    size={20}
                  />
                </Flex>
                <Text size="2" color="gray" className="mt-2 line-clamp-1">
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
        ))}
      </div>
    </main>
  );
}

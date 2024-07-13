import React from "react";
import { Heading, Text, Box, Flex, Card, Badge } from "@radix-ui/themes";
import { GitHubLogoIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { projects } from "../../../../../data/projects";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const project = getProjectData(slug);
  return {
    title: project?.title,
    description: project?.description.slice(0, 160),
    openGraph: {
      description: project?.description.slice(0, 160),
      title: project?.title,
      type: "website",
      images: [
        {
          url: project?.image || "",
          width: 1200,
          height: 630,

          alt: project?.title,
        },
      ],
    },
  };
}
export async function generateStaticParams() {
  return projects.map((project) => project);
}

// Mock data (replace with actual data fetching logic)
const getProjectData = (slug: String) =>
  projects.find((project) => project.slug === slug);

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectData(params.slug);

  if (!project) {
    return <Text size="5">Project not found</Text>;
  }
  return (
    <Box className="container mx-auto px-4 py-8">
      <Heading size="8" className="mb-6">
        {project?.title}
      </Heading>

      <Flex direction="column" gap="6">
        <Card>
          <Flex direction="column" gap="4">
            <Image
              loading="lazy"
              width={1000}
              height={300}
              style={{ objectFit: "cover", maxHeight: 300 }}
              src={project.image}
              alt={project.title}
              className="w-full h-auto rounded-lg "
            />
            <Text size="5">{project.description}</Text>
            <Text as="p" size="3" className="text-gray-700">
              {project.longDescription}
            </Text>
            <Flex wrap="wrap" gap="2">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="soft">
                  {tech}
                </Badge>
              ))}
            </Flex>
            <Flex gap="4"></Flex>
          </Flex>
        </Card>

        <Card>
          <Heading size="6" className="mb-4">
            Project Details
          </Heading>
          <Flex direction="column" gap="2">
            <Text>
              <strong>Started:</strong>{" "}
              {project?.startDate?.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <Text>
              <strong>Role:</strong> {project.myRole}
            </Text>
            {project.roleDescription?.split("\n").map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
}

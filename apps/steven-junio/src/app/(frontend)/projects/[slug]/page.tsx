import React from "react";
import {
  Heading,
  Text,
  Box,
  Flex,
  Card,
  Badge,
  Button,
} from "@radix-ui/themes";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { projects } from "../../../../../data/projects";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectData(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: project.title,
    description: project.description.slice(0, 160),
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      description: project.description.slice(0, 160),
      title: project.title,
      type: "website",
      url: `/projects/${project.slug}`,
      images: project.image
        ? [
            {
              url: project.image,
              width: 1200,
              height: 630,
              alt: project.title,
            },
          ]
        : undefined,
    },
  };
}
export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

// Mock data (replace with actual data fetching logic)
const getProjectData = (slug: string) =>
  projects.find((project) => project.slug === slug);

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectData(slug);

  if (!project) {
    notFound();
  }
  const liveUrl =
    ("liveUrl" in project && project.liveUrl) ||
    ("url" in project && project.url);

  return (
    <Box className="container mx-auto px-4 py-8">
      <Heading size="8" className="mb-6">
        {project.title}
      </Heading>

      <Flex direction="column" gap="6">
        <Card>
          <Flex direction="column" gap="4">
            {!project.video ? (
              <Image
                loading="lazy"
                width={1000}
                height={500}
                style={{
                  objectFit: "contain",
                  maxWidth: "700px",
                  margin: "0 auto",
                }}
                src={project.image}
                alt={project.title}
                className="w-full rounded-lg"
              />
            ) : (
              <video
                controls
                playsInline
                preload="none"
                aria-label={`${project.title} project video`}
                className="w-full max-h-[500px] rounded-lg"
              >
                <source src={project.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
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
            {liveUrl && (
              <Link
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button style={{ cursor: "pointer" }}>
                  <ExternalLink size={16} />
                  Visit website
                </Button>
              </Link>
            )}
          </Flex>
        </Card>

        <Card>
          <Heading size="6" className="mb-4">
            Project Details
          </Heading>
          <Flex direction="column" gap="2">
            <Text>
              <strong>Started:</strong>{" "}
              {project.startDate?.toLocaleDateString("en-US", {
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
            {project.gitHubUrl && (
              <Link
                href={project.gitHubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button style={{ cursor: "pointer" }}>
                  <GitHubLogoIcon />
                  View on GitHub
                </Button>
              </Link>
            )}
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
}

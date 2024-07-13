import { MetadataRoute } from "next";
import { projects } from "../../data/projects";

export default function siteMap(): MetadataRoute.Sitemap {
  const baseUrl = "https://stevenjunio.com";
  const staticRoutes = [
    {
      url: `${baseUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const projectSiteMap = projects.map((project) => {
    return {
      url: `${baseUrl}/projects/${project.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  return [...staticRoutes, ...projectSiteMap] as MetadataRoute.Sitemap;
}

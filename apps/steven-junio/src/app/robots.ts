import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/blog/post", "/auth"],
    },
    sitemap: "https://www.stevenjunio.com/sitemap.xml",
    host: "https://www.stevenjunio.com",
  };
}

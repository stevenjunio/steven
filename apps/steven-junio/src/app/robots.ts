import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/v1/agent/public", "/ask", "/blog/post", "/auth", "/login"],
    },
    sitemap: "https://www.stevenjunio.com/sitemap.xml",
    host: "https://www.stevenjunio.com",
  };
}

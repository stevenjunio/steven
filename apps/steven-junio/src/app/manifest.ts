import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Steven's Agent",
    short_name: "My Agent",
    description: "Talk with Steven's personal agent and add to its memory.",
    start_url: "/admin/agent",
    display: "standalone",
    background_color: "#f5f5f4",
    theme_color: "#020617",
    icons: [
      {
        src: "/images/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

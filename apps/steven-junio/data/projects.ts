export const projects = [
  {
    slug: "this",
    title: "StevenJunio.com",
    image: "/images/steven-junio-screenshot.webp",
    description: "This site",
    technologies: [
      "React",
      "Next.js",
      "Node.js",
      "Vercel",
      "Tailwind CSS",
      "TypeScript",
      "Radix UI",
      "Postgres",
    ],
  },
  {
    slug: "syllabus",
    title: "Syllabus",
    image: "/images/syllabus-screenshot.webp",
    description: "A modern SEO analysis tool",
    longDescription:
      "Syllabus is a modern SEO analysis tool that helps you understand how your website is performing in search engines. It provides you with a detailed report of your website's SEO performance, including keyword rankings, backlinks, and more.",
    technologies: [
      "React",
      "Next.js",
      "Tailwind CSS",
      "Node.js",
      "TypeScript",
      "PostgreSQL",
      "Docker",
      "Cloudflare",
      "Railway",
      "Playwright",
      "Bubble.io",
      "n8n",
    ],
    liveUrl: "https://syllabus.io",
    myRole: "Senior Software Developer",
    roleDescription:
      "My time was split 60/40 between front-end and back-end development. I was responsible for major performance overhaul projects, on the front-end and backend. I built out major features that allowed users to deeply analyze webpage content using PIXI.js as the rendering engine. \nI implemented continuous testing utilizing Playwright. I build custom infrastructure using docker and Railway to deploy scalable testing shards to allow instant, parallel testing of webpages. \n I also built out major infrastructure changes to pull a dockerized version of n8n with workers to allow for scalable, parallelized workflows.",
    startDate: new Date("September 2022"),
  },
  {
    slug: "outskirts",
    title: "Outskirts",
    image: "/images/outskirts-screenshot.webp",
    description: "Marketplace for Agriculture equipment",
    technologies: ["Bubble.io", "Javascript", "HTML", "CSS", "node.js"],
  },
  {
    slug: "tubey-the-tubeman",
    title: "Tubey The Tubeman",
    image: "/images/tubey-the-tubeman.webp",
    video:
      "https://files.stevenjunio.com/Tubey%202.0%20Website%20%20Video_FINAL_50%20mbps.mp4",
    description: "The original Mini Wacky Wavy Inflatable Arm Flailing Tubeman",
    technologies: ["Shopify"],
  },
  {
    slug: "my-daily-workouts-co",
    title: "MyDailyWorkoutsCo",
    image: "/images/MyDailyWorkoutsCo-screenshot.webp",
    description: "Automated workout generator",
    technologies: ["Bubble.io", "Javascript", "HTML", "CSS"],
  },

  {
    slug: "electrified",
    title: "Electrified",
    image: "/images/electrified-screenshot.webp",
    description: "Marketplace for c2c sale of used Electric bikes",
    technologies: ["Bubble.io"],
  },
  {
    slug: "image-cropper-plugin",
    title: "Image Cropper Plugin",
    image: "/images/image-cropper-plugin-screenshot.webp",
    description:
      "Custom built plugin for Bubble that creates a cropping element. Uses cropper.js. 200+ installs.",
    technologies: ["Javascript", "HTML", "CSS"],
  },
  {
    slug: "multi-file-selector-plugin",
    title: "Multi-file Selector Plugin",
    image: "/images/multi-file-selector-and-uploader-plugin-screenshot.webp",
    description: "Plugin that displays images/files without uploading to aws",
    technologies: ["Javascript", "HTML", "CSS"],
  },

  {
    slug: "bubble-random-generator-plugin",
    title: "Bubble Random Generator Plugin",
    image: "/images/random-number-plugin.webp",
    description: "Server side plugin that generates randoms",
    technologies: ["Bubble.io", "Javascript"],
  },
];

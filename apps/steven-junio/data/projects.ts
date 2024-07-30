import { url } from "inspector";
import { start } from "repl";

export const projects = [
  {
    slug: "little-lemon-restaurant",
    title: "Little Lemon Restaurant",
    image: "/images/little-lemon-restaurant-screenshot.webp",
    description: "Restaurant website built using React",
    technologies: ["React", "Node.js", "react-router-dom"],
    myRole: "To finish a long running half-finished course",
    roleDescription:
      "Personal project I spun up as a part of a capstone project in a React course",
    url: "https://little-lemon-restaurant-51e.pages.dev/",
    startDate: new Date("September 2021"),
    gitHubUrl: "https://github.com/stevenjunio/little-lemon-restaurant",
  },

  {
    slug: "n8n-railway-template",
    title: "Railway Template for n8n with workers",
    image: "/images/railway-template-n8n-with-workers.webp",
    description:
      "Railway template for n8n with workers, built using Docker containers",
    technologies: ["Docker", "n8n", "Postgres", "Node.js", "Redis"],
    myRole: "For funsies",
    roleDescription:
      "I built this to provide a simple way to spin up a n8n instance with workers using Railway. It uses Docker containers to run n8n and the workers. Users can create infinite workers to scale their workflows. It also includes a Postgres database and Redis cache.",
    startDate: new Date("September 2022"),
    url: "https://railway.app/template/EfkjX2?referralCode=lJoDnn",
  },
  {
    slug: "this",
    title: "StevenJunio.com",
    image: "/images/steven-junio-screenshot.webp",
    description: "This site",
    technologies: [
      "React",
      "Next.js",
      "Three.js",
      "Radix UI",
      "Node.js",
      "Tailwind CSS",
      "TypeScript",
      "Postgres",
      "Zod",
      "Prisma",
      "Cloudflare r2",
      "Auth0",
      "Vercel",
    ],
    myRole: "For funsies",
    roleDescription:
      "I built this site to showcase my work and document it permanently using Next.js. I used Radix UI for the design system and Tailwind CSS for styling. I used TypeScript for type safety and Vercel for deployment.",
    startDate: new Date("September 2021"),
    gitHubUrl: "https://github.com/stevenjunio/steven",
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
    myRole: "Chief Technology Officer",
    roleDescription:
      "Spearheaded technical strategy and oversaw creation of core features for web application utilizing Bubble.io, transitioning from concept to launch with 30,000+ monthly users",
    technologies: ["Bubble.io", "Javascript", "HTML", "CSS", "node.js"],
    startDate: new Date("March 2018"),
  },
  {
    slug: "tubey-the-tubeman",
    title: "Tubey The Tubeman",
    image: "/images/tubey-the-tubeman.webp",
    video:
      "https://files.stevenjunio.com/Tubey%202.0%20Website%20%20Video_FINAL_50%20mbps.mp4",
    description: "The original Mini Wacky Wavy Inflatable Arm Flailing Tubeman",
    myRole: "Co-founder",
    roleDescription:
      "Co-founded Tubey The Tubeman, a company that creates and sells mini wacky wavy inflatable arm flailing tubemen. I was responsible for the technical strategy and implementation of the website and marketing automation. Raised $25,000+ in crowdfunding to design the original Mini Wacky Wavy Inflatable Arm Flailing Tubeman",
    technologies: ["Shopify"],
    startDate: new Date("June 2016"),
  },
  {
    slug: "my-daily-workouts-co",
    title: "MyDailyWorkoutsCo",
    image: "/images/MyDailyWorkoutsCo-screenshot.webp",
    description: "Automated workout generator",
    technologies: ["Bubble.io", "Javascript", "HTML", "CSS"],
    myRole: "Creater",
    roleDescription:
      "Created an automated workout generator for the web that automatically generated daily workout routines and automatically shared those to instagram on a page with 75k+ followers",
    startDate: new Date("March 2017"),
  },

  {
    slug: "electrified",
    title: "Electrified",
    image: "/images/electrified-screenshot.webp",
    description: "Marketplace for c2c sale of used Electric bikes",
    technologies: ["Bubble.io", "Javascript", "HTML", "CSS"],
    myRole: "Creator",
    roleDescription:
      "Created a marketplace for the c2c sale of used electric bikes",
  },
  {
    slug: "image-cropper-plugin",
    title: "Image Cropper Plugin",
    image: "/images/image-cropper-plugin-screenshot.webp",
    description:
      "Custom built plugin for Bubble that creates a cropping element. Uses cropper.js. 200+ installs.",
    technologies: ["Javascript", "HTML", "CSS"],
    startDate: new Date("May 2019"),
    myRole: "Creator",
  },
  {
    slug: "multi-file-selector-plugin",
    title: "Multi-file Selector Plugin",
    image: "/images/multi-file-selector-and-uploader-plugin-screenshot.webp",
    description: "Plugin that displays images/files without uploading to aws",
    technologies: ["Javascript", "HTML", "CSS"],
    startDate: new Date("May 2019"),
    myRole: "Creator",
  },

  {
    slug: "bubble-random-generator-plugin",
    title: "Bubble Random Generator Plugin",
    image: "/images/random-number-plugin.webp",
    description: "Server side plugin that generates randoms",
    technologies: ["Bubble.io", "Javascript"],
    startDate: new Date("April 2019"),
    myRole: "Creator",
  },
];

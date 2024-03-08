/** @type {import('next').NextConfig} */
import path from "path";
const __dirname = path.resolve(path.dirname(''));
console.log(`dirname`, path.join(__dirname, "../.."));
const nextConfig = {
    experimental: {
        ...(process.env.NODE_ENV === "development"
            ? { outputFileTracingRoot: path.join(__dirname, "../..") }
            : null),
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'source.unsplash.com',
                port: '',
                pathname: '/random/**',
            },
        ],
    },
};

export default nextConfig;
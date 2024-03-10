// app/api/auth/[auth0]/route.js
import { handleAuth } from '@auth0/nextjs-auth0';

console.log(process.env.AUTH0_BASE_URL);
export const GET = handleAuth();
import { Auth0Client } from "@auth0/nextjs-auth0/server";

const isConfigured = Boolean(
  process.env.AUTH0_DOMAIN &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_SECRET &&
    (process.env.AUTH0_CLIENT_SECRET ||
      process.env.AUTH0_CLIENT_ASSERTION_SIGNING_KEY),
);

export const auth0 = isConfigured ? new Auth0Client() : null;

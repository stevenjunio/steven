import { Auth0Client } from "@auth0/nextjs-auth0/server";

export function getAuth0Domain() {
  return (process.env.AUTH0_DOMAIN ?? process.env.AUTH0_ISSUER_BASE_URL)
    ?.replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

export function getAppBaseUrl() {
  return process.env.APP_BASE_URL ?? process.env.AUTH0_BASE_URL;
}

const domain = getAuth0Domain();
const isConfigured = Boolean(
  domain &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_SECRET &&
    (process.env.AUTH0_CLIENT_SECRET ||
      process.env.AUTH0_CLIENT_ASSERTION_SIGNING_KEY),
);

export const auth0 = isConfigured
  ? new Auth0Client({ domain, appBaseUrl: getAppBaseUrl() })
  : null;

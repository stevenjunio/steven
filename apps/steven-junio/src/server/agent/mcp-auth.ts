import { createRemoteJWKSet, jwtVerify } from "jose";
import { getAuth0Domain } from "@/lib/auth0";

export async function authorizeMcp(request: Request, requiredScope: string) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const domain = getAuth0Domain();
  const audience = process.env.AUTH0_MCP_AUDIENCE;
  if (!token || !domain || !audience) return null;

  const issuer = `https://${domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}/`;
  try {
    const jwks = createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`));
    const { payload } = await jwtVerify(token, jwks, { issuer, audience });
    const adminSubjects = new Set(
      (process.env.AUTH0_ADMIN_SUBS ?? "").split(",").map((value) => value.trim()).filter(Boolean),
    );
    const scopes = new Set(typeof payload.scope === "string" ? payload.scope.split(/\s+/) : []);
    return payload.sub && adminSubjects.has(payload.sub) && scopes.has(requiredScope)
      ? { subject: payload.sub, scopes }
      : null;
  } catch {
    return null;
  }
}

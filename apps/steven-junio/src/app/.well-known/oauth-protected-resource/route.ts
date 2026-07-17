import { NextResponse } from "next/server";
import { getAuth0Domain } from "@/lib/auth0";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const domain = getAuth0Domain();
  return NextResponse.json({
    resource: `${origin}/mcp`,
    authorization_servers: domain ? [`https://${domain}/`] : [],
    scopes_supported: ["steven:ask", "steven:search", "steven:memory:propose"],
    bearer_methods_supported: ["header"],
  });
}

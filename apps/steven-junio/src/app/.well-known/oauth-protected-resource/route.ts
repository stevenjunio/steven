import { NextResponse } from "next/server";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const domain = process.env.AUTH0_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return NextResponse.json({
    resource: `${origin}/mcp`,
    authorization_servers: domain ? [`https://${domain}/`] : [],
    scopes_supported: ["steven:ask", "steven:search", "steven:memory:propose"],
    bearer_methods_supported: ["header"],
  });
}

import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth0?.getSession();
  const subject = session?.user?.sub;
  if (!subject) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }

  return NextResponse.json(
    { subject },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

import { NextResponse } from "next/server";
import { getAdminSubject } from "@/library/isUserAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { isOwner: Boolean(await getAdminSubject()) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

import { NextResponse } from "next/server";
import { execSync } from "child_process";

export const maxDuration = 120;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const expectedToken = `Bearer ${process.env.CRON_SECRET || ""}`;

  if (!expectedToken || expectedToken === "Bearer ") {
    return NextResponse.json({ ok: false, error: "CRON_SECRET not configured" }, { status: 500 });
  }

  if (authHeader !== expectedToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const output = execSync("node scripts/sync-matches.mjs", {
      encoding: "utf-8",
      timeout: 100_000,
      env: { ...process.env },
    }).trim();

    return NextResponse.json({ ok: true, output });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.stderr || err.message || String(err) }, { status: 500 });
  }
}

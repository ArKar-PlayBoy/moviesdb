import { NextResponse } from "next/server";
import { execSync, type ExecException } from "child_process";

export const maxDuration = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const output = execSync("node scripts/sync-matches.mjs", {
      encoding: "utf-8",
      timeout: 100_000,
      env: { ...process.env },
    }).trim();

    return NextResponse.json({ ok: true, output });
  } catch (err: unknown) {
    const execErr = err as ExecException;
    const msg = execErr.stderr || execErr.message || String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

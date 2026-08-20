import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function ensureSchema() {
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS invitations (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, email TEXT NOT NULL, normalized_email TEXT NOT NULL, ip_hash TEXT NOT NULL, created_at TEXT NOT NULL)"),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS invitations_normalized_email_unique ON invitations (normalized_email)"),
  ]);
}

async function hash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  let payload: { email?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const normalizedEmail = email.toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 400 });
  }

  const forwarded = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const ipHash = await hash(forwarded.trim());
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();

  try {
    await ensureSchema();
    const recent = await env.DB.prepare("SELECT COUNT(*) AS count FROM invitations WHERE ip_hash = ? AND created_at >= ?")
      .bind(ipHash, oneMinuteAgo).first<{ count: number }>();
    if ((recent?.count ?? 0) >= 4) {
      return NextResponse.json({ ok: false, message: "Please wait a moment before trying again." }, { status: 429 });
    }

    await env.DB.prepare("INSERT INTO invitations (email, normalized_email, ip_hash, created_at) VALUES (?, ?, ?, ?)")
      .bind(email, normalizedEmail, ipHash, new Date().toISOString()).run();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const detail = error instanceof Error ? error.message.toLowerCase() : "";
    if (detail.includes("unique") || detail.includes("constraint")) {
      return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
    }
    return NextResponse.json({ ok: false, message: "We couldn’t take you there just yet. Please try again." }, { status: 503 });
  }
}

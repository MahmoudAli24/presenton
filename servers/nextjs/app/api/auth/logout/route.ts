import { NextResponse } from "next/server";

const COOKIE_NAME = "presenton-admin";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}

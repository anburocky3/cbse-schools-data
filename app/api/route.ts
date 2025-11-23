import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "API is running",
    status: "ok",
    author: "Anbuselvan Rocky",
    openSource: true,
    github: "https://github.com/anburocky3/cbse-schools-data",
  });
}

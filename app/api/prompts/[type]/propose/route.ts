import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  try {
    const body = await request.json();

    // Extract the session cookie from the browser's incoming request
    const cookieHeader = request.headers.get("cookie") || undefined;
    
    // Extract authorization/x-api-key if passed in headers
    const apiKey = request.headers.get("x-api-key") || process.env.BACKEND_API_KEY || "";

    const res = await backendFetch(`/prompts/${type}/propose`, {
      method: "POST",
      cookie: cookieHeader, // Pass as top-level property so lib/backend.ts picks it up
      headers: {
        "x-api-key": apiKey,
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to propose change" },
      { status: 500 }
    );
  }
}
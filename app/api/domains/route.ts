import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const BACKEND_URL = process.env.BACKEND_URL!;
const API_AUTH = process.env.API_AUTH!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

function getSessionToken() {
  return crypto
    .createHmac("sha256", ADMIN_PASSWORD)
    .update("authenticated")
    .digest("hex");
}

function isAuthenticated(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;

  return session === getSessionToken();
}

async function backendRequest(
  req: NextRequest,
  method: string
) {
  // Make sure the user entered the website password
  if (!isAuthenticated(req)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body =
      method === "GET"
        ? undefined
        : await req.json();

    const url = new URL(
      `${BACKEND_URL}/domains`
    );

    // GET /api/domains?filter=BLOCKED
    // becomes
    // GET localhost:3000/domains?filter=BLOCKED
    if (method === "GET") {
      const filter =
        req.nextUrl.searchParams.get("filter");

      if (filter) {
        url.searchParams.set("filter", filter);
      }
    }

    const response = await fetch(url.toString(), {
      method,

      headers: {
        Authorization: `Bearer ${API_AUTH}`,

        ...(body
          ? {
              "Content-Type": "application/json",
            }
          : {}),
      },

      body: body
        ? JSON.stringify(body)
        : undefined,

      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Backend request failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to communicate with backend",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest
) {
  return backendRequest(req, "GET");
}

export async function POST(
  req: NextRequest
) {
  return backendRequest(req, "POST");
}

export async function PATCH(
  req: NextRequest
) {
  return backendRequest(req, "PATCH");
}

export async function DELETE(
  req: NextRequest
) {
  return backendRequest(req, "DELETE");
}
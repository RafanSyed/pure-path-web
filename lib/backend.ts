// lib/backend.ts
// Server-side only — BACKEND_URL never gets exposed to the client since this
// file is only ever imported by app/api/* route handlers, not client components.

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export async function backendFetch(
  path: string,
  options: RequestInit & { cookie?: string } = {}
): Promise<Response> {
  const { cookie, headers, ...rest } = options;

  return fetch(`${BACKEND_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(headers || {}),
    },
  });
}
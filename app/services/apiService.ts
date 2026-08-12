const BACKEND_URL = process.env.BACKEND_URL;
const API_AUTH = process.env.API_AUTH;

if (!BACKEND_URL) {
  throw new Error("BACKEND_URL is not defined");
}

if (!API_AUTH) {
  throw new Error("API_AUTH is not defined");
}

export type DomainFilter = "BLOCKED" | "SAFE" | "OKAY";

export interface Domain {
  domain: string;
  filter: DomainFilter;
}

export async function lookupDomain(domain: string) {
  const response = await fetch(
    `${BACKEND_URL}/domains/lookup?domain=${encodeURIComponent(domain)}`
  );

  if (!response.ok) {
    throw new Error("Failed to lookup domain");
  }

  return response.json();
}

export async function getDomains(filter?: DomainFilter) {
  const url = new URL(`${BACKEND_URL}/domains`);

  if (filter) {
    url.searchParams.set("filter", filter);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to fetch domains");
  }

  return response.json();
}

export async function addDomain(
  domain: string,
  filter: DomainFilter
) {
  const response = await fetch(`${BACKEND_URL}/domains`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_AUTH}`,
    },
    body: JSON.stringify({
      domain,
      filter,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to add domain");
  }

  return data;
}

export async function updateDomain(
  domain: string,
  filter: DomainFilter
) {
  const response = await fetch(`${BACKEND_URL}/domains`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_AUTH}`,
    },
    body: JSON.stringify({
      domain,
      filter,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update domain");
  }

  return data;
}

export async function removeDomain(domain: string) {
  const response = await fetch(`${BACKEND_URL}/domains`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_AUTH}`,
    },
    body: JSON.stringify({
      domain,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to remove domain");
  }

  return data;
}
export type DomainFilter =
  | "BLOCKED"
  | "SAFE"
  | "OKAY";

export interface Domain {
  domain: string;
  filter: DomainFilter;
}

export interface DomainsResponse {
  domains: Domain[];
}

export interface AddDomainResponse {
  success: boolean;
  added: boolean;
  domain: string;
  filter: DomainFilter;
  message?: string;
}

export interface UpdateDomainResponse {
  success: boolean;
  domain: string;
  filter: DomainFilter;
}

export interface RemoveDomainResponse {
  success: boolean;
  removed: string;
}

// Get all domains
export async function getDomains(
  filter?: DomainFilter,
): Promise<DomainsResponse> {
  const url = new URL("/api/domains", window.location.origin);

  if (filter) {
    url.searchParams.set("filter", filter);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch domains");
  }

  return data;
}

// Add a new domain
export async function addDomain(
  domain: string,
  filter: DomainFilter,
): Promise<AddDomainResponse> {
  const response = await fetch("/api/domains", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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

// Update a domain's filter
export async function updateDomain(
  domain: string,
  filter: DomainFilter,
): Promise<UpdateDomainResponse> {
  const response = await fetch("/api/domains", {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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

// Remove a domain completely
export async function removeDomain(
  domain: string,
): Promise<RemoveDomainResponse> {
  const response = await fetch("/api/domains", {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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

export interface PromptItem {
  promptType: string;
  text: string;
  updatedAt: string;
}

export interface ReviewDetails {
  promptType: string;
  oldText: string;
  newText: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

// Fetch all prompts
export async function getPrompts(): Promise<{ prompts: PromptItem[] }> {
  const res = await fetch("/api/prompts");
  if (!res.ok) throw new Error("Failed to fetch prompts");
  return res.json();
}

// Propose a prompt edit
export async function proposePromptChange(type: string, newText: string) {
  const res = await fetch(`/api/prompts/${type}/propose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newText }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to propose change");
  return data;
}

// Fetch details for a secret token link
export async function getReviewDetails(token: string): Promise<ReviewDetails> {
  const res = await fetch(`/api/review/${token}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Invalid review token");
  return data;
}

// Approve or reject a proposed change
export async function resolveReview(token: string, action: "approve" | "reject") {
  const res = await fetch(`/api/review/${token}/${action}`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Failed to ${action}`);
  return data;
}
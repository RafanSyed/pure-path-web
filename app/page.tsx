"use client";

import { useEffect, useState } from "react";

import {
addDomain,
getDomains,
removeDomain,
updateDomain,
type Domain,
type DomainFilter,
} from "./services/apiService";

const FILTERS: DomainFilter[] = [
"SAFE",
"OKAY",
"BLOCKED",
];

export default function Home() {
const [authenticated, setAuthenticated] = useState(false);

const [password, setPassword] = useState("");

const [domains, setDomains] = useState<Domain[]>([]);

const [activeTab, setActiveTab] =
useState<DomainFilter>("BLOCKED");

const [newDomain, setNewDomain] = useState("");

const [loading, setLoading] = useState(false);

const [loginLoading, setLoginLoading] = useState(false);

const [error, setError] = useState("");

// -------------------------
// LOGIN
// -------------------------

async function login() {
if (!password.trim()) return;
setLoginLoading(true);
setError("");

try {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Incorrect password"
    );
  }

  setAuthenticated(true);
  setPassword("");
} catch (error) {
  setError(
    error instanceof Error
      ? error.message
      : "Login failed"
  );
} finally {
  setLoginLoading(false);
}

}

// -------------------------
// LOAD DOMAINS
// -------------------------

async function loadDomains() {
setLoading(true);
setError("");

try {
  const data = await getDomains();

  setDomains(data.domains || []);
} catch (error) {
  setError(
    error instanceof Error
      ? error.message
      : "Failed to load domains"
  );
} finally {
  setLoading(false);
}

}

useEffect(() => {
if (authenticated) {
loadDomains();
}
}, [authenticated]);

// -------------------------
// CHANGE / REMOVE DOMAIN
// -------------------------

async function handleDomainChange(
domain: string,
value: string
) {
setError("");

try {
  if (value === "REMOVE") {
    await removeDomain(domain);
  } else {
    await updateDomain(
      domain,
      value as DomainFilter
    );
  }

  await loadDomains();
} catch (error) {
  setError(
    error instanceof Error
      ? error.message
      : "Failed to update domain"
  );
}

}

// -------------------------
// ADD DOMAIN
// -------------------------

async function handleAddDomain() {
const domain = newDomain.trim();

if (!domain) return;

setError("");

try {
  await addDomain(domain, activeTab);

  setNewDomain("");

  await loadDomains();
} catch (error) {
  setError(
    error instanceof Error
      ? error.message
      : "Failed to add domain"
  );
}

}

// -------------------------
// FILTER DOMAINS
// -------------------------

const visibleDomains = domains.filter(
(domain) => domain.filter === activeTab
);

// -------------------------
// PASSWORD SCREEN
// -------------------------

if (!authenticated) {
return ( <main className="login-page"> <div className="login-box"> <div className="lock-icon">🔒</div>

```
      <h1>Pure Path</h1>

      <p>
        Enter your password to manage your
        domains.
      </p>

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) =>
          setPassword(event.target.value)
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            login();
          }
        }}
        autoFocus
      />

      <button
        onClick={login}
        disabled={loginLoading}
      >
        {loginLoading
          ? "Unlocking..."
          : "Unlock"}
      </button>

      {error && (
        <div className="login-error">
          {error}
        </div>
      )}
    </div>
  </main>
);

}

// -------------------------
// MAIN WEBSITE
// -------------------------

return ( <main className="app"> <div className="container">

```
    {/* HEADER */}

    <header className="header">
      <div>
        <h1>Pure Path</h1>

        <p>
          Manage your domain filters.
        </p>
      </div>

      <button
        className="refresh-button"
        onClick={loadDomains}
      >
        ↻ Refresh
      </button>
    </header>

    {/* TABS */}

    <div className="tabs">
      {FILTERS.map((filter) => {
        const count = domains.filter(
          (domain) =>
            domain.filter === filter
        ).length;

        const label =
          filter === "BLOCKED"
            ? "BLOCK"
            : filter;

        return (
          <button
            key={filter}
            className={
              activeTab === filter
                ? "tab active"
                : "tab"
            }
            onClick={() =>
              setActiveTab(filter)
            }
          >
            <span>{label}</span>

            <span className="count">
              {count}
            </span>
          </button>
        );
      })}
    </div>

    {/* ADD DOMAIN */}

    <div className="add-section">
      <input
        type="text"
        placeholder="Enter a domain, e.g. example.com"
        value={newDomain}
        onChange={(event) =>
          setNewDomain(event.target.value)
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleAddDomain();
          }
        }}
      />

      <button onClick={handleAddDomain}>
        Add{" "}
        {activeTab === "BLOCKED"
          ? "BLOCK"
          : activeTab}
      </button>
    </div>

    {/* ERROR */}

    {error && (
      <div className="error-box">
        {error}
      </div>
    )}

    {/* DOMAIN LIST */}

    <section className="domain-section">
      <div className="section-header">
        <div>
          <h2>
            {activeTab === "BLOCKED"
              ? "BLOCK"
              : activeTab}{" "}
            Domains
          </h2>

          <p>
            {visibleDomains.length} domain
            {visibleDomains.length !== 1
              ? "s"
              : ""}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="empty">
          Loading domains...
        </div>
      ) : visibleDomains.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            ◌
          </div>

          <h3>No domains here</h3>

          <p>
            Add a domain using the field above.
          </p>
        </div>
      ) : (
        <div className="domain-list">
          {visibleDomains.map((domain) => (
            <div
              className="domain-row"
              key={domain.domain}
            >
              <span className="domain-name">
                {domain.domain}
              </span>

              <select
                value={domain.filter}
                onChange={(event) =>
                  handleDomainChange(
                    domain.domain,
                    event.target.value
                  )
                }
              >
                <option value="SAFE">
                  SAFE
                </option>

                <option value="OKAY">
                  OKAY
                </option>

                <option value="BLOCKED">
                  BLOCK
                </option>

                <option value="REMOVE">
                  REMOVE
                </option>
              </select>
            </div>
          ))}
        </div>
      )}
    </section>

  </div>
</main>

);
}

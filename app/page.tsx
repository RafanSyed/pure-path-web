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

const FILTERS: DomainFilter[] = ["SAFE", "OKAY", "BLOCKED"];

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [activeTab, setActiveTab] = useState<DomainFilter>("BLOCKED");
  const [newDomain, setNewDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper to normalize input domain names (trims, strips protocol & trailing slashes)
  function normalizeDomain(input: string): string {
    return input
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
  }

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
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Incorrect password");
      }

      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load domains");
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

  async function handleDomainChange(domain: string, value: string) {
    setError("");

    try {
      if (value === "REMOVE") {
        await removeDomain(domain);
      } else {
        await updateDomain(domain, value as DomainFilter);
      }

      await loadDomains();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update domain"
      );
    }
  }

  // -------------------------
  // ADD DOMAIN
  // -------------------------

  async function handleAddDomain() {
    const domainToFormat = normalizeDomain(newDomain);

    if (!domainToFormat) return;

    // Check if domain already exists anywhere in state
    const existing = domains.find(
      (item) => item.domain.toLowerCase() === domainToFormat
    );

    if (existing) {
      const filterDisplay =
        existing.filter === "BLOCKED" ? "BLOCK" : existing.filter;
      setError(
        `"${domainToFormat}" already exists in the ${filterDisplay} list.`
      );
      return;
    }

    setError("");
    setActionLoading(true);

    try {
      await addDomain(domainToFormat, activeTab);
      setNewDomain("");
      await loadDomains();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setActionLoading(false);
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
    return (
      <main className="login-page">
        <div className="login-box">
          <div className="lock-badge">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1>Pure Path</h1>
          <p>Enter your password to manage your domain filters.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />

            <button type="submit" disabled={loginLoading || !password.trim()}>
              {loginLoading ? "Unlocking..." : "Unlock Dashboard"}
            </button>
          </form>

          {error && <div className="error-box">{error}</div>}
        </div>
      </main>
    );
  }

  // -------------------------
  // MAIN WEBSITE
  // -------------------------

  return (
    <main className="app">
      <div className="container">
        {/* HEADER */}
        <header className="header">
          <div>
            <div className="brand-tag">
              <span className="dot" />
              Pure Path Admin
            </div>
            <h1>Domain Management</h1>
            <p>Configure custom rules and domain strictness levels.</p>
          </div>

          <button
            className="refresh-button"
            onClick={loadDomains}
            disabled={loading}
          >
            <svg
              className={loading ? "spin" : ""}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </header>

        {/* TABS */}
        <div className="tabs">
          {FILTERS.map((filter) => {
            const count = domains.filter(
              (domain) => domain.filter === filter
            ).length;

            const label = filter === "BLOCKED" ? "BLOCK" : filter;

            return (
              <button
                key={filter}
                className={`tab ${activeTab === filter ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(filter);
                  setError("");
                }}
              >
                <span>{label}</span>
                <span className="count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* ADD DOMAIN */}
        <div className="add-card">
          <label className="input-label">Add domain to {activeTab === "BLOCKED" ? "BLOCK" : activeTab}</label>
          <div className="add-section">
            <input
              type="text"
              placeholder="e.g. example.com or sub.site.org"
              value={newDomain}
              onChange={(e) => {
                setNewDomain(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddDomain();
                }
              }}
            />

            <button
              onClick={handleAddDomain}
              disabled={actionLoading || !newDomain.trim()}
            >
              {actionLoading
                ? "Adding..."
                : `Add to ${activeTab === "BLOCKED" ? "BLOCK" : activeTab}`}
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="error-box">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* DOMAIN LIST */}
        <section className="domain-section">
          <div className="section-header">
            <div>
              <h2>
                {activeTab === "BLOCKED" ? "BLOCK" : activeTab} Domains
              </h2>
              <p>
                {visibleDomains.length} domain
                {visibleDomains.length !== 1 ? "s" : ""} in this category
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty">
              <div className="spinner" />
              <p>Fetching active rules...</p>
            </div>
          ) : visibleDomains.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🌐</div>
              <h3>No domains listed</h3>
              <p>
                Add a domain above to enforce {activeTab === "BLOCKED" ? "BLOCK" : activeTab} rules.
              </p>
            </div>
          ) : (
            <div className="domain-list">
              {visibleDomains.map((domain) => (
                <div className="domain-row" key={domain.domain}>
                  <div className="domain-info">
                    <span className="status-indicator" />
                    <span className="domain-name">{domain.domain}</span>
                  </div>

                  <select
                    value={domain.filter}
                    onChange={(e) =>
                      handleDomainChange(domain.domain, e.target.value)
                    }
                  >
                    <option value="SAFE">SAFE</option>
                    <option value="OKAY">OKAY</option>
                    <option value="BLOCKED">BLOCK</option>
                    <option value="REMOVE">Remove Rule</option>
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
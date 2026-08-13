"use client";

import { use, useEffect, useState } from "react";
import { getReviewDetails, resolveReview, type ReviewDetails } from "@/app/services/apiService";

export default function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  // Unwrap Next.js 15 async route params
  const { token } = use(params);

  const [details, setDetails] = useState<ReviewDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadReview() {
    setLoading(true);
    setError("");
    try {
      const data = await getReviewDetails(token);
      setDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired review link.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadReview();
    }
  }, [token]);

  async function handleResolve(action: "approve" | "reject") {
    setActionLoading(true);
    setError("");
    try {
      const res = await resolveReview(token, action);
      setMessage(res.message);
      // Refresh status locally
      if (details) {
        setDetails({
          ...details,
          status: action === "approve" ? "APPROVED" : "REJECTED",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} proposed prompt.`);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="app">
        <div className="container">
          <div className="empty">
            <div className="spinner" />
            <p>Loading prompt review details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !details) {
    return (
      <main className="login-page">
        <div className="login-box">
          <h1>Review Link Invalid</h1>
          <p>{error || "This change request is unavailable."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <div className="container" style={{ maxWidth: "900px" }}>
        <header className="header">
          <div>
            <div className="brand-tag">
              <span className="dot" />
              Prompt Review Portal
            </div>
            <h1>{details.promptType}</h1>
            <p>Review proposed changes before applying to live systems.</p>
          </div>

          <div
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "12px",
              textTransform: "uppercase",
              backgroundColor:
                details.status === "PENDING"
                  ? "rgba(234, 179, 8, 0.2)"
                  : details.status === "APPROVED"
                  ? "rgba(34, 197, 94, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
              color:
                details.status === "PENDING"
                  ? "#eab308"
                  : details.status === "APPROVED"
                  ? "#22c55e"
                  : "#ef4444",
            }}
          >
            {details.status}
          </div>
        </header>

        {message && (
          <div className="add-card" style={{ marginBottom: "20px" }}>
            <span>{message}</span>
          </div>
        )}

        {/* COMPARISON DIFF VIEW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          {/* OLD PROMPT */}
          <div className="add-card">
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#ef4444" }}>Current Live Text</h3>
            <textarea
              readOnly
              rows={12}
              value={details.oldText || "(Empty)"}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.3)",
                color: "inherit",
                fontFamily: "monospace",
                fontSize: "13px",
              }}
            />
          </div>

          {/* NEW PROMPT */}
          <div className="add-card">
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#22c55e" }}>Proposed Text</h3>
            <textarea
              readOnly
              rows={12}
              value={details.newText}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.3)",
                color: "inherit",
                fontFamily: "monospace",
                fontSize: "13px",
              }}
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        {details.status === "PENDING" ? (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleResolve("reject")}
              style={{
                backgroundColor: "#ef4444",
                borderColor: "#ef4444",
                padding: "12px 24px",
              }}
            >
              Reject Change
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleResolve("approve")}
              style={{
                backgroundColor: "#22c55e",
                borderColor: "#22c55e",
                padding: "12px 24px",
              }}
            >
              Approve & Apply
            </button>
          </div>
        ) : (
          <div className="empty">
            <p>This proposal has already been <strong>{details.status.toLowerCase()}</strong>.</p>
          </div>
        )}
      </div>
    </main>
  );
}
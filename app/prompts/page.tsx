"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPrompts, proposePromptChange, type PromptItem } from "@/app/services/apiService";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [editedText, setEditedText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submittingType, setSubmittingType] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getPrompts();
      setPrompts(data.prompts || []);

      // Populate text editor state
      const initialMap: Record<string, string> = {};
      (data.prompts || []).forEach((p) => {
        initialMap[p.promptType] = p.text;
      });
      setEditedText(initialMap);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to load prompts",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handlePropose(promptType: string) {
    const textToPropose = editedText[promptType];
    const originalPrompt = prompts.find((p) => p.promptType === promptType);

    if (originalPrompt && originalPrompt.text === textToPropose) {
      setStatusMessage({ type: "error", text: "No changes made to this prompt." });
      return;
    }

    setSubmittingType(promptType);
    setStatusMessage(null);

    try {
      const res = await proposePromptChange(promptType, textToPropose);
      setStatusMessage({ type: "success", text: res.message || "Change proposed successfully!" });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to propose change",
      });
    } finally {
      setSubmittingType(null);
    }
  }

  return (
    <main className="app">
      <div className="container" style={{ maxWidth: "800px" }}>
        <header className="header">
          <div>
            <div className="brand-tag">
              <span className="dot" />
              Pure Path Admin
            </div>
            <h1>Prompts Management</h1>
            <p>Edit AI instructions and send proposed changes for reviewer approval.</p>
          </div>

          <Link href="/" className="refresh-button">
            ← Home
          </Link>
        </header>

        {statusMessage && (
          <div className={statusMessage.type === "error" ? "error-box" : "add-card"} style={{ marginBottom: "20px" }}>
            <span>{statusMessage.text}</span>
          </div>
        )}

        {loading ? (
          <div className="empty">
            <div className="spinner" />
            <p>Fetching active prompts...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {prompts.map((item) => {
              const isEdited = editedText[item.promptType] !== item.text;
              const isSubmitting = submittingType === item.promptType;

              return (
                <div key={item.promptType} className="add-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>{item.promptType}</h3>
                    <span style={{ fontSize: "12px", opacity: 0.6 }}>
                      Last updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(0,0,0,0.2)",
                      color: "inherit",
                      fontFamily: "monospace",
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                    value={editedText[item.promptType] ?? ""}
                    onChange={(e) =>
                      setEditedText((prev) => ({
                        ...prev,
                        [item.promptType]: e.target.value,
                      }))
                    }
                  />

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                    {isEdited && (
                      <button
                        type="button"
                        className="refresh-button"
                        onClick={() =>
                          setEditedText((prev) => ({
                            ...prev,
                            [item.promptType]: item.text,
                          }))
                        }
                      >
                        Reset Changes
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={!isEdited || isSubmitting}
                      onClick={() => handlePropose(item.promptType)}
                      style={{ padding: "8px 16px" }}
                    >
                      {isSubmitting ? "Sending..." : "Send for Review"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
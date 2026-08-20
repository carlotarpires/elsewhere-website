"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function SubscribeForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const form = event.currentTarget;
    const email = new FormData(form).get("email")?.toString().trim() ?? "";
    if (!form.reportValidity() || !email) return;

    setStatus("submitting");
    setMessage("Taking you Elsewhere…");
    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message);
      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("We couldn’t take you there just yet. Please try again.");
    }
  }

  return (
    <div className={`form-transition ${status === "success" ? "is-success" : ""}`}>
      <div className="form-entry" aria-hidden={status === "success"}>
        <form className="subscribe-form" onSubmit={handleSubmit} aria-describedby="form-status privacy-note">
          <label className="sr-only" htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="Your email" required disabled={status === "success"} aria-invalid={status === "error"} aria-describedby={status === "error" ? "form-status privacy-note" : "privacy-note"} />
          <button type="submit" disabled={status === "submitting" || status === "success"}>
            {status === "submitting" ? "Taking you Elsewhere…" : <><span>TAKE ME ELSEWHERE</span><span className="submit-arrow" aria-hidden="true">→</span></>}
          </button>
        </form>
        <p id="form-status" className={`form-status ${status === "error" ? "is-error" : ""}`} role="status" aria-live="polite">{status === "error" ? message : ""}</p>
        <p id="privacy-note" className="privacy-note">Your email is used only for Elsewhere invitations.</p>
      </div>
      <div className="form-success" role="status" aria-live="polite" aria-hidden={status !== "success"}>
        {status === "success" && <><span>You’re on the Elsewhere list.</span><em>We’ll write when Chapter One is ready.</em></>}
      </div>
    </div>
  );
}

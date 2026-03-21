"use client";

import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DonationBanner from "@/components/DonationBanner";

type ResultData = {
  improved: string;
  tips: string[];
};

export default function Home() {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvText.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, targetRole }),
      });

      if (res.status === 429) {
        setError(
          "You've reached the daily limit (3 improvements per day). Come back tomorrow!"
        );
        return;
      }

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();
      setResult(data);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.improved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: result.improved }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maxcv-improved-resume.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Improve your resume
            <br />
            <span className="text-accent">in seconds</span>
          </h1>
          <p className="text-muted text-lg max-w-md mx-auto">
            Paste your CV below and let AI rewrite it to stand out.
            Free, no sign-up required.
          </p>
        </section>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label
              htmlFor="cv"
              className="block text-sm font-medium mb-1.5"
            >
              Your current resume
            </label>
            <textarea
              id="cv"
              rows={10}
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y transition placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium mb-1.5"
            >
              Target role or industry{" "}
              <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              id="role"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Frontend Developer, Marketing Manager..."
              className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !cvText.trim()}
            className="w-full bg-accent text-white font-medium py-3 px-6 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Improving your resume...
              </span>
            ) : (
              "Improve my resume"
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div ref={resultRef} className="space-y-6">
            <div className="border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Improved Resume</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-sm text-accent hover:text-accent-hover font-medium transition cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="text-sm text-muted hover:text-gray-900 font-medium transition cursor-pointer"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {result.improved}
              </pre>
            </div>

            {result.tips.length > 0 && (
              <div className="bg-accent-light rounded-lg p-6">
                <h3 className="text-sm font-semibold mb-3">
                  Tips to strengthen your profile
                </h3>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-700 flex gap-2"
                    >
                      <span className="text-accent mt-0.5 shrink-0">
                        &bull;
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DonationBanner />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

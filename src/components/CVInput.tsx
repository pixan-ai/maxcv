"use client";

import { useState, useRef, useCallback } from "react";

type InputMode = "text" | "file" | "sheets";

interface CVInputProps {
  cvText: string; setCvText: (t: string) => void;
  targetRole: string; setTargetRole: (r: string) => void;
  onSubmit: () => void; loading: boolean;
  error: string | null; setError: (e: string | null) => void;
  isEs: boolean; submitLabel: string; loadingLabel: string;
  hideSubmit?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const T = {
  en: {
    tabText: "Paste text", tabFile: "Upload PDF", tabSheets: "Google Sheets",
    labelCv: "Your resume", placeholderCv: "Paste your resume text here...", chars: "chars",
    labelRole: "Target role", optional: "optional",
    placeholderRole: "e.g. Product Manager, Software Engineer...",
    uploadIdle: "Drop your PDF here or click to browse",
    uploadMeta: "PDF only · max 5MB",
    uploading: "Uploading file...",
    analyzing: "Analyzing with AI...",
    parseError: "Could not read the file. Try pasting your resume instead.",
    uploadSuccess: "File loaded", changeFile: "Change",
    clearText: "Clear",
    sheetsLabel: "Google Sheets link",
    sheetsPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    sheetsHint: 'The sheet must be shared as "Anyone with the link"',
    sheetsButton: "Import", sheetsLoading: "Importing...",
    sheetsError: "Could not access Google Sheet.",
    fileTooLarge: "File is too large. Maximum 5MB.",
    fileWrongType: "Only PDF files accepted.",
    privacy: "Your CV is processed in real-time and never stored.",
    hintTime: "This may take up to 60 seconds. Keep this page open.",
  },
  es: {
    tabText: "Pegar texto", tabFile: "Subir PDF", tabSheets: "Google Sheets",
    labelCv: "Tu currículum", placeholderCv: "Pega el texto de tu currículum aquí...", chars: "caracteres",
    labelRole: "Puesto objetivo", optional: "opcional",
    placeholderRole: "ej. Product Manager, Ingeniero de Software...",
    uploadIdle: "Arrastra tu PDF aquí o haz clic para buscar",
    uploadMeta: "Solo PDF · máx 5MB",
    uploading: "Subiendo archivo...",
    analyzing: "Analizando con IA...",
    parseError: "No se pudo leer el archivo. Intenta pegando tu CV.",
    uploadSuccess: "Archivo cargado", changeFile: "Cambiar",
    clearText: "Limpiar",
    sheetsLabel: "Enlace de Google Sheets",
    sheetsPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    sheetsHint: 'Debe estar compartido como "Cualquier persona con el enlace"',
    sheetsButton: "Importar", sheetsLoading: "Importando...",
    sheetsError: "No se pudo acceder al Google Sheet.",
    fileTooLarge: "Archivo muy grande. Máximo 5MB.",
    fileWrongType: "Solo se aceptan archivos PDF.",
    privacy: "Tu CV se procesa en tiempo real y nunca se almacena.",
    hintTime: "Este proceso puede tardar hasta 60 segundos. No cierres la página.",
  },
};

type UploadPhase = "idle" | "uploading" | "analyzing" | "done";

export default function CVInput({
  cvText, setCvText, targetRole, setTargetRole,
  onSubmit, loading, error, setError,
  isEs, submitLabel, loadingLabel, hideSubmit,
}: CVInputProps) {
  const t = isEs ? T.es : T.en;
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isReady = !loading && cvText.trim().length >= 50;

  const isProcessing = phase === "uploading" || phase === "analyzing";
  const isDone = phase === "done";

  const progress = phase === "uploading" ? 40 : phase === "analyzing" ? 80 : phase === "done" ? 100 : 0;
  const statusText = phase === "uploading" ? t.uploading : phase === "analyzing" ? t.analyzing : "";

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > MAX_FILE_SIZE) return t.fileTooLarge;
      if (!file.name.toLowerCase().endsWith(".pdf")) return t.fileWrongType;
      return null;
    },
    [t]
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      const err = validateFile(file);
      if (err) { setError(err); return; }

      setError(null);
      setFileName(file.name);
      setPhase("uploading");

      try {
        const form = new FormData();
        form.append("file", file);
        setPhase("analyzing");
        const res = await fetch("/api/parse", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || t.parseError);
          setFileName("");
          setPhase("idle");
          return;
        }
        setCvText(data.text);
        setPhase("done");
      } catch {
        setError(t.parseError);
        setFileName("");
        setPhase("idle");
      }
    },
    [validateFile, setError, setCvText, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleSheetsImport = useCallback(async () => {
    if (!sheetsUrl.trim()) return;
    setSheetsLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("sheetsUrl", sheetsUrl);
      const res = await fetch("/api/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t.sheetsError); return; }
      setCvText(data.text);
      setSheetsUrl("");
      setInputMode("text");
    } catch {
      setError(t.sheetsError);
    } finally {
      setSheetsLoading(false);
    }
  }, [sheetsUrl, setError, setCvText, t]);

  const resetFile = () => {
    setFileName("");
    setPhase("idle");
    setCvText("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const tabs: { mode: InputMode; label: string }[] = [
    { mode: "file", label: t.tabFile },
    { mode: "text", label: t.tabText },
    { mode: "sheets", label: t.tabSheets },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-ink-100">
        {tabs.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setInputMode(mode)}
            className={`flex-1 px-3 py-2.5 text-sm transition cursor-pointer -mb-px ${
              inputMode === mode
                ? "text-accent border-b-2 border-accent font-medium"
                : "text-ink-400 hover:text-ink-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* File upload tab */}
      {inputMode === "file" && (
        <div className="space-y-2.5">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !isProcessing && !isDone && fileRef.current?.click()}
            className="relative"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
            />

            {/* Box — same border/radius as all other inputs in the form */}
            <div
              className={`flex items-center px-4 h-12 w-full rounded-xl border bg-white transition-all ${
                isProcessing
                  ? "border-transparent"
                  : dragOver
                  ? "border-accent/60"
                  : isDone
                  ? "border-positive/60"
                  : "border-ink-200 hover:border-ink-300 cursor-pointer"
              }`}
            >
              {isDone ? (
                <>
                  <span className="flex-1 text-sm truncate text-ink-800" style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>
                    {fileName}
                  </span>
                  <div
                    className="ml-3 flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: 18, height: 18, background: "oklch(0.55 0.15 155)" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </>
              ) : isProcessing ? (
                <span className="text-sm text-ink-400" style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>
                  {statusText}
                </span>
              ) : (
                <span className="text-sm text-ink-300" style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>
                  {t.uploadIdle}
                </span>
              )}
            </div>

            {/* Animated border while processing */}
            {isProcessing && (
              <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                  border: "1.5px solid oklch(0.55 0.2 260)",
                  animation: "cv-border-pulse 1.8s ease-in-out infinite",
                }}
              />
            )}

            {/* Progress bar — bottom edge */}
            {isProcessing && (
              <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: 2, borderRadius: "0 0 12px 12px" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "oklch(0.55 0.2 260)",
                    transition: "width 0.8s ease",
                  }}
                />
              </div>
            )}
          </div>

          {/* Hint / success */}
          {isDone ? (
            <div
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg"
              style={{ background: "oklch(0.97 0.02 155)", border: "0.5px solid oklch(0.88 0.06 155)" }}
            >
              <div className="flex-shrink-0 rounded-full" style={{ width: 5, height: 5, background: "oklch(0.55 0.15 155)" }} />
              <span className="text-[13px] flex-1 truncate" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "oklch(0.38 0.1 155)" }}>
                {t.uploadSuccess}
              </span>
              <button type="button" onClick={resetFile} className="text-xs transition cursor-pointer" style={{ color: "oklch(0.5 0.08 155)" }}>
                {t.changeFile}
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full mt-0.5"
                style={{ width: 15, height: 15, border: "1px solid var(--ink-200)" }}
              >
                <div className="rounded-full" style={{ width: 4, height: 4, background: "var(--ink-300)" }} />
              </div>
              <p className="text-[13px]" style={{ color: "var(--ink-400)", lineHeight: 1.5 }}>
                {isProcessing ? t.hintTime : t.uploadMeta}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Text tab */}
      {inputMode === "text" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="cv-input" className="text-sm font-medium text-ink-700">{t.labelCv}</label>
            {cvText.length > 0 && (
              <button
                type="button"
                onClick={() => { setCvText(""); setFileName(""); setPhase("idle"); }}
                className="text-xs text-ink-400 hover:text-ink-700 transition cursor-pointer"
              >
                {t.clearText}
              </button>
            )}
          </div>
          <textarea
            id="cv-input"
            rows={12}
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder={t.placeholderCv}
            required
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y transition placeholder:text-ink-300"
          />
          {cvText.length > 0 && (
            <p className="text-xs text-ink-400 mt-1.5">
              {cvText.length.toLocaleString()} {t.chars}{fileName ? ` — ${fileName}` : ""}
            </p>
          )}
        </div>
      )}

      {/* Sheets tab */}
      {inputMode === "sheets" && (
        <div className="space-y-3">
          <div>
            <label htmlFor="sheets-url" className="text-sm font-medium text-ink-700 mb-2 block">{t.sheetsLabel}</label>
            <input
              id="sheets-url"
              type="url"
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
              placeholder={t.sheetsPlaceholder}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition placeholder:text-ink-300"
            />
            <p className="text-xs text-ink-400 mt-1.5">{t.sheetsHint}</p>
          </div>
          <button
            type="button"
            onClick={handleSheetsImport}
            disabled={sheetsLoading || !sheetsUrl.trim()}
            className={`w-full font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer ${
              sheetsLoading || !sheetsUrl.trim()
                ? "bg-ink-100 text-ink-300 cursor-not-allowed"
                : "bg-accent text-white hover:bg-accent-dim"
            }`}
          >
            {sheetsLoading ? <Spinner label={t.sheetsLoading} /> : t.sheetsButton}
          </button>
        </div>
      )}

      {/* Target role */}
      <div>
        <label htmlFor="target-role" className="text-sm font-medium text-ink-700 mb-2 block">
          {t.labelRole} <span className="text-ink-400 font-normal">({t.optional})</span>
        </label>
        <input
          id="target-role"
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder={t.placeholderRole}
          className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition placeholder:text-ink-300"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-warning-ghost border border-warning/20 text-ink-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Submit */}
      {!hideSubmit && (
        <>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isReady}
            className={`w-full font-medium py-3.5 px-6 rounded-xl transition-colors text-sm ${
              isReady
                ? "bg-accent text-white hover:bg-accent-dim cursor-pointer"
                : "bg-ink-100 text-ink-300 cursor-not-allowed"
            }`}
          >
            {loading ? <Spinner label={loadingLabel} /> : submitLabel}
          </button>

          <p className="text-center text-xs text-ink-300 flex items-center justify-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            {t.privacy}
          </p>
        </>
      )}

      <style>{`
        @keyframes cv-border-pulse {
          0%, 100% { opacity: 1; border-color: oklch(0.55 0.2 260); }
          50%       { opacity: 0.45; border-color: oklch(0.68 0.14 260); }
        }
      `}</style>
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label}
    </span>
  );
}

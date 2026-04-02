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
    labelRole: "Target role", optional: "optional", placeholderRole: "e.g. Product Manager, Software Engineer...",
    uploadIdle: "Drop your PDF here or click to browse",
    uploadMeta: "PDF only · max 5MB",
    stageReading: "reading document", stageExperience: "extracting experience", stageSkills: "analyzing skills",
    parseError: "Could not read the file. Try pasting your resume instead.",
    uploadSuccess: "File loaded", changeFile: "Change", clearText: "Clear",
    sheetsLabel: "Google Sheets link", sheetsPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    sheetsHint: "The sheet must be shared as \"Anyone with the link\"",
    sheetsButton: "Import", sheetsLoading: "Importing...", sheetsError: "Could not access Google Sheet.",
    fileTooLarge: "File is too large. Maximum 5MB.", fileWrongType: "Only PDF files accepted.",
    privacy: "Your CV is processed in real-time and never stored.",
    hintTime: "This may take up to 60 seconds. Keep this page open.",
  },
  es: {
    tabText: "Pegar texto", tabFile: "Subir PDF", tabSheets: "Google Sheets",
    labelCv: "Tu currículum", placeholderCv: "Pega el texto de tu currículum aquí...", chars: "caracteres",
    labelRole: "Puesto objetivo", optional: "opcional", placeholderRole: "ej. Product Manager, Ingeniero de Software...",
    uploadIdle: "Arrastra tu PDF aquí o haz clic para buscar",
    uploadMeta: "Solo PDF · máx 5MB",
    stageReading: "leyendo documento", stageExperience: "extrayendo experiencia", stageSkills: "analizando habilidades",
    parseError: "No se pudo leer el archivo. Intenta pegando tu CV.",
    uploadSuccess: "Archivo cargado", changeFile: "Cambiar", clearText: "Limpiar",
    sheetsLabel: "Enlace de Google Sheets", sheetsPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    sheetsHint: "Debe estar compartido como \"Cualquier persona con el enlace\"",
    sheetsButton: "Importar", sheetsLoading: "Importando...", sheetsError: "No se pudo acceder al Google Sheet.",
    fileTooLarge: "Archivo muy grande. Máximo 5MB.", fileWrongType: "Solo se aceptan archivos PDF.",
    privacy: "Tu CV se procesa en tiempo real y nunca se almacena.",
    hintTime: "Este proceso puede tardar hasta 60 segundos. No cierres la página.",
  },
};

// Simulated upload progress stages
const UPLOAD_STAGES = [
  { key: "reading",     progress: 20 },
  { key: "experience", progress: 55 },
  { key: "skills",     progress: 85 },
  { key: "done",       progress: 100 },
] as const;

type UploadStage = typeof UPLOAD_STAGES[number]["key"];

export default function CVInput({
  cvText, setCvText, targetRole, setTargetRole,
  onSubmit, loading, error, setError,
  isEs, submitLabel, loadingLabel, hideSubmit,
}: CVInputProps) {
  const t = isEs ? T.es : T.en;
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [uploadStage, setUploadStage] = useState<UploadStage | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileLoaded, setFileLoaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isReady = !loading && cvText.trim().length >= 50;

  const currentProgress = uploadStage
    ? (UPLOAD_STAGES.find((s) => s.key === uploadStage)?.progress ?? 0)
    : 0;

  const stageLabel = (stage: UploadStage | null) => {
    if (!stage || stage === "done") return "";
    if (stage === "reading") return t.stageReading + "...";
    if (stage === "experience") return t.stageExperience + "...";
    return t.stageSkills + "...";
  };

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
      setFileLoaded(false);
      setUploadStage("reading");

      // Animate through stages while waiting for response
      const stageTimer1 = setTimeout(() => setUploadStage("experience"), 1800);
      const stageTimer2 = setTimeout(() => setUploadStage("skills"), 4000);

      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/parse", { method: "POST", body: form });
        const data = await res.json();
        clearTimeout(stageTimer1);
        clearTimeout(stageTimer2);
        if (!res.ok) {
          setError(data.error || t.parseError);
          setFileName("");
          setUploadStage(null);
          return;
        }
        setUploadStage("done");
        setCvText(data.text);
        setFileLoaded(true);
      } catch {
        clearTimeout(stageTimer1);
        clearTimeout(stageTimer2);
        setError(t.parseError);
        setFileName("");
        setUploadStage(null);
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
    setFileLoaded(false);
    setUploadStage(null);
    setCvText("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploading = uploadStage !== null && uploadStage !== "done";

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
        <div className="space-y-3">
          {/* Section label */}
          <p
            className="text-[11px] font-medium tracking-widest uppercase"
            style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--ink-700)" }}
          >
            {t.tabFile}
          </p>

          {/* Input shell */}
          <div
            className="relative"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && !fileLoaded && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
            />

            {/* Main input box */}
            <div
              className={`flex items-center px-4 transition-all ${
                fileLoaded ? "h-12" : "h-12 cursor-pointer"
              }`}
              style={{
                border: uploading ? "none" : `1px solid ${
                  dragOver
                    ? "oklch(0.55 0.2 260 / 0.6)"
                    : fileLoaded
                    ? "oklch(0.55 0.15 155)"
                    : "var(--ink-200)"
                }`,
                borderRadius: "6px",
                background: "white",
                outline: uploading ? "none" : undefined,
                boxSizing: "border-box",
              }}
            >
              {fileLoaded ? (
                <>
                  <span
                    className="flex-1 text-sm truncate"
                    style={{
                      fontFamily: "var(--font-geist-mono, monospace)",
                      color: "var(--ink-900)",
                    }}
                  >
                    {fileName}
                  </span>
                  {/* Check circle */}
                  <div
                    className="ml-3 flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: 18,
                      height: 18,
                      background: "oklch(0.55 0.15 155)",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </>
              ) : uploading ? (
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-geist-mono, monospace)",
                    color: "var(--ink-500)",
                  }}
                >
                  {stageLabel(uploadStage)}
                </span>
              ) : (
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-geist-mono, monospace)",
                    color: "var(--ink-300)",
                  }}
                >
                  {t.uploadIdle}
                </span>
              )}
            </div>

            {/* Animated border ring while uploading */}
            {uploading && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  borderRadius: "7px",
                  border: "1.5px solid oklch(0.55 0.2 260)",
                  animation: "cv-border-pulse 1.8s ease-in-out infinite",
                }}
              />
            )}

            {/* Progress bar — bottom edge */}
            {uploading && (
              <div
                className="absolute bottom-0 left-0 right-0 overflow-hidden"
                style={{ height: 2, borderRadius: "0 0 6px 6px" }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${currentProgress}%`,
                    background: "oklch(0.55 0.2 260)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            )}
          </div>

          {/* Stage pills */}
          {uploading && (
            <div className="flex gap-1.5 flex-wrap">
              {([
                { key: "reading",     label: t.stageReading },
                { key: "experience", label: t.stageExperience },
                { key: "skills",     label: t.stageSkills },
              ] as const).map(({ key, label }) => {
                const stageOrder = ["reading", "experience", "skills"] as const;
                const currentIdx = stageOrder.indexOf(uploadStage as typeof stageOrder[number]);
                const pillIdx = stageOrder.indexOf(key);
                const isDone = pillIdx < currentIdx;
                const isCurrent = pillIdx === currentIdx;
                return (
                  <span
                    key={key}
                    className="text-[11px] px-2 py-0.5 rounded"
                    style={{
                      fontFamily: "var(--font-geist-mono, monospace)",
                      letterSpacing: "0.04em",
                      textDecoration: isDone ? "line-through" : "none",
                      background: isCurrent
                        ? "oklch(0.55 0.2 260 / 0.08)"
                        : isDone
                        ? "transparent"
                        : "var(--ink-050)",
                      color: isCurrent
                        ? "oklch(0.45 0.2 260)"
                        : isDone
                        ? "var(--ink-400)"
                        : "var(--ink-300)",
                    }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Success banner */}
          {fileLoaded && (
            <div
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded"
              style={{
                background: "oklch(0.97 0.02 155)",
                border: "0.5px solid oklch(0.85 0.06 155)",
              }}
            >
              <div
                className="flex-shrink-0 rounded-full"
                style={{ width: 6, height: 6, background: "oklch(0.55 0.15 155)" }}
              />
              <span
                className="text-[13px]"
                style={{
                  fontFamily: "var(--font-geist-mono, monospace)",
                  color: "oklch(0.35 0.1 155)",
                }}
              >
                {t.uploadSuccess} — {fileName}
              </span>
              <button
                type="button"
                onClick={resetFile}
                className="ml-auto text-xs transition cursor-pointer"
                style={{ color: "oklch(0.5 0.08 155)" }}
              >
                {t.changeFile}
              </button>
            </div>
          )}

          {/* Hint */}
          {!fileLoaded && (
            <div className="flex items-start gap-2">
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full mt-0.5"
                style={{
                  width: 16,
                  height: 16,
                  border: "1px solid var(--ink-200)",
                }}
              >
                <div
                  className="rounded-full"
                  style={{ width: 5, height: 5, background: "var(--ink-300)" }}
                />
              </div>
              <p className="text-[13px]" style={{ color: "var(--ink-400)", lineHeight: 1.5 }}>
                {uploading ? t.hintTime : t.uploadMeta}
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
                onClick={() => { setCvText(""); setFileName(""); setFileLoaded(false); }}
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

      {/* Keyframes for border pulse animation */}
      <style>{`
        @keyframes cv-border-pulse {
          0%, 100% { opacity: 1; border-color: oklch(0.55 0.2 260); }
          50% { opacity: 0.5; border-color: oklch(0.7 0.15 260); }
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

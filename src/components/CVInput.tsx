"use client";

import { useState, useRef, useCallback } from "react";

type InputMode = "text" | "file" | "sheets";

interface CVInputProps {
  cvText: string;
  setCvText: (text: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  isEs: boolean;
  submitLabel: string;
  loadingLabel: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const T = {
  en: {
    tabText: "Paste text",
    tabFile: "Upload PDF",
    tabSheets: "Google Sheets",
    labelCv: "Your resume",
    placeholderCv: "Paste your resume text here...",
    chars: "chars",
    labelRole: "Target role",
    optional: "optional",
    placeholderRole: "e.g. Product Manager, Software Engineer...",
    uploadTitle: "Drop your PDF here",
    uploadSub: "or click to browse",
    uploadMeta: "PDF only · max 5MB · Word? Save as PDF first",
    parsing: "Reading your file...",
    parseError: "Could not read the file. Try pasting your resume instead.",
    uploadSuccess: "File loaded",
    changeFile: "Change",
    clearText: "Clear",
    sheetsLabel: "Google Sheets link",
    sheetsPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    sheetsHint: "The sheet must be shared as \"Anyone with the link\"",
    sheetsButton: "Import",
    sheetsLoading: "Importing...",
    sheetsError: "Could not access Google Sheet.",
    fileTooLarge: "File is too large. Maximum 5MB.",
    fileWrongType: "Only PDF files accepted.",
    privacy: "Your CV is processed in real-time and never stored.",
  },
  es: {
    tabText: "Pegar texto",
    tabFile: "Subir PDF",
    tabSheets: "Google Sheets",
    labelCv: "Tu currículum",
    placeholderCv: "Pega el texto de tu currículum aquí...",
    chars: "caracteres",
    labelRole: "Puesto objetivo",
    optional: "opcional",
    placeholderRole: "ej. Product Manager, Ingeniero de Software...",
    uploadTitle: "Arrastra tu PDF aquí",
    uploadSub: "o haz clic para buscar",
    uploadMeta: "Solo PDF · máx 5MB · ¿Word? Guárdalo como PDF",
    parsing: "Leyendo tu archivo...",
    parseError: "No se pudo leer el archivo. Intenta pegando tu CV.",
    uploadSuccess: "Archivo cargado",
    changeFile: "Cambiar",
    clearText: "Limpiar",
    sheetsLabel: "Enlace de Google Sheets",
    sheetsPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    sheetsHint: "Debe estar compartido como \"Cualquier persona con el enlace\"",
    sheetsButton: "Importar",
    sheetsLoading: "Importando...",
    sheetsError: "No se pudo acceder al Google Sheet.",
    fileTooLarge: "Archivo muy grande. Máximo 5MB.",
    fileWrongType: "Solo se aceptan archivos PDF.",
    privacy: "Tu CV se procesa en tiempo real y nunca se almacena.",
  },
};

export default function CVInput({
  cvText, setCvText, targetRole, setTargetRole,
  onSubmit, loading, error, setError, isEs, submitLabel, loadingLabel,
}: CVInputProps) {
  const t = isEs ? T.es : T.en;
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileLoaded, setFileLoaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isReady = !loading && cvText.trim().length >= 50;

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) return t.fileTooLarge;
    if (!file.name.toLowerCase().endsWith(".pdf")) return t.fileWrongType;
    return null;
  }, [t]);

  const handleFileUpload = useCallback(async (file: File) => {
    const err = validateFile(file);
    if (err) { setError(err); return; }
    setUploading(true); setError(null); setFileName(file.name); setFileLoaded(false);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t.parseError); setFileName(""); return; }
      setCvText(data.text); setFileLoaded(true);
    } catch { setError(t.parseError); setFileName(""); }
    finally { setUploading(false); }
  }, [validateFile, setError, setCvText, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleSheetsImport = useCallback(async () => {
    if (!sheetsUrl.trim()) return;
    setSheetsLoading(true); setError(null);
    try {
      const form = new FormData();
      form.append("sheetsUrl", sheetsUrl);
      const res = await fetch("/api/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t.sheetsError); return; }
      setCvText(data.text); setSheetsUrl(""); setInputMode("text");
    } catch { setError(t.sheetsError); }
    finally { setSheetsLoading(false); }
  }, [sheetsUrl, setError, setCvText, t]);

  const resetFile = () => {
    setFileName(""); setFileLoaded(false); setCvText("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const tabs: { mode: InputMode; label: string }[] = [
    { mode: "file", label: t.tabFile },
    { mode: "text", label: t.tabText },
    { mode: "sheets", label: t.tabSheets },
  ];

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 bg-[--ink-050] p-1 rounded-lg">
        {tabs.map(({ mode, label }) => (
          <button key={mode} type="button" onClick={() => setInputMode(mode)}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition cursor-pointer ${
              inputMode === mode
                ? "bg-white text-[--ink-900] font-medium shadow-sm"
                : "text-[--ink-500] hover:text-[--ink-700]"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* File Upload */}
      {inputMode === "file" && (
        <div>
          {fileLoaded && fileName ? (
            <div className="flex items-center gap-3 bg-[--accent-ghost] border border-[--accent]/15 rounded-lg px-5 py-4">
              <div className="w-8 h-8 rounded-md bg-[--accent]/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-[--accent]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[--ink-900]">{t.uploadSuccess}</p>
                <p className="text-xs text-[--ink-500] truncate">{fileName}</p>
              </div>
              <button type="button" onClick={resetFile}
                className="text-xs text-[--ink-500] hover:text-[--ink-900] font-medium transition cursor-pointer">
                {t.changeFile}
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl py-12 px-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-[--accent] bg-[--accent-ghost] scale-[1.01]"
                  : "border-[--ink-200] hover:border-[--ink-300] hover:bg-[--ink-050]"
              }`}>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[--accent] border-t-transparent animate-spin" />
                  <p className="text-sm text-[--ink-500]">{t.parsing}</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-[--ink-050] flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-[--ink-400]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[--ink-900]">{t.uploadTitle}</p>
                  <p className="text-sm text-[--ink-400] mt-1">{t.uploadSub}</p>
                  <p className="text-xs text-[--ink-300] mt-3">{t.uploadMeta}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Text Input */}
      {inputMode === "text" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="cv-input" className="text-sm font-medium text-[--ink-700]">{t.labelCv}</label>
            {cvText.length > 0 && (
              <button type="button" onClick={() => { setCvText(""); setFileName(""); setFileLoaded(false); }}
                className="text-xs text-[--ink-400] hover:text-[--ink-700] transition cursor-pointer">
                {t.clearText}
              </button>
            )}
          </div>
          <textarea id="cv-input" rows={12} value={cvText} onChange={(e) => setCvText(e.target.value)}
            placeholder={t.placeholderCv} required
            className="w-full rounded-xl border border-[--ink-200] bg-white px-4 py-3.5 text-sm text-[--ink-900] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[--accent]/20 focus:border-[--accent] resize-y transition placeholder:text-[--ink-300]" />
          {cvText.length > 0 && (
            <p className="text-xs text-[--ink-400] mt-1.5">
              {cvText.length.toLocaleString()} {t.chars}
              {fileName ? ` — ${fileName}` : ""}
            </p>
          )}
        </div>
      )}

      {/* Google Sheets */}
      {inputMode === "sheets" && (
        <div className="space-y-3">
          <div>
            <label htmlFor="sheets-url" className="text-sm font-medium text-[--ink-700] mb-2 block">{t.sheetsLabel}</label>
            <input id="sheets-url" type="url" value={sheetsUrl} onChange={(e) => setSheetsUrl(e.target.value)}
              placeholder={t.sheetsPlaceholder}
              className="w-full rounded-xl border border-[--ink-200] bg-white px-4 py-3 text-sm text-[--ink-900] focus:outline-none focus:ring-2 focus:ring-[--accent]/20 focus:border-[--accent] transition placeholder:text-[--ink-300]" />
            <p className="text-xs text-[--ink-400] mt-1.5">{t.sheetsHint}</p>
          </div>
          <button type="button" onClick={handleSheetsImport}
            disabled={sheetsLoading || !sheetsUrl.trim()}
            className={`w-full font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer ${
              sheetsLoading || !sheetsUrl.trim()
                ? "bg-[--ink-100] text-[--ink-300] cursor-not-allowed"
                : "bg-[--accent] text-white hover:bg-[--accent-dim]"
            }`}>
            {sheetsLoading ? <Spinner label={t.sheetsLoading} /> : t.sheetsButton}
          </button>
        </div>
      )}

      {/* Target role */}
      <div>
        <label htmlFor="target-role" className="text-sm font-medium text-[--ink-700] mb-2 block">
          {t.labelRole} <span className="text-[--ink-400] font-normal">({t.optional})</span>
        </label>
        <input id="target-role" type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
          placeholder={t.placeholderRole}
          className="w-full rounded-xl border border-[--ink-200] bg-white px-4 py-3 text-sm text-[--ink-900] focus:outline-none focus:ring-2 focus:ring-[--accent]/20 focus:border-[--accent] transition placeholder:text-[--ink-300]" />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[--warning-ghost] border border-[--warning]/20 text-[--ink-700] text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Submit */}
      <button type="button" onClick={onSubmit} disabled={!isReady}
        className={`w-full font-medium py-3.5 px-6 rounded-xl transition-colors text-sm ${
          isReady
            ? "bg-[--accent] text-white hover:bg-[--accent-dim] cursor-pointer"
            : "bg-[--ink-100] text-[--ink-300] cursor-not-allowed"
        }`}>
        {loading ? <Spinner label={loadingLabel} /> : submitLabel}
      </button>

      {/* Privacy */}
      <p className="text-center text-xs text-[--ink-300] flex items-center justify-center gap-1.5">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        {t.privacy}
      </p>
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

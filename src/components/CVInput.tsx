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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const T = {
  en: {
    tabText: "Paste text",
    tabFile: "Upload PDF",
    tabSheets: "Google Sheets",
    labelCv: "Your resume",
    placeholderCv: "Paste your resume text here...",
    chars: "chars",
    maxPages: "Max ~5 pages",
    labelRole: "Target role",
    optional: "optional",
    placeholderRole: "e.g. Product Manager, Software Engineer...",
    uploadTitle: "Drop your PDF here",
    uploadOr: "or",
    uploadButton: "Browse files",
    uploadHint: "PDF only \u2014 max 5MB",
    uploadWordHint: "Word CV? Save as PDF first.",
    parsing: "Reading your file...",
    parseError: "Could not read the file. Try pasting your resume instead.",
    uploadSuccess: "File loaded successfully",
    changeFile: "Change file",
    clearText: "Clear",
    sheetsLabel: "Google Sheets link",
    sheetsPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    sheetsHint: "Make sure it's shared as \"Anyone with the link\"",
    sheetsButton: "Import from Google Sheets",
    sheetsLoading: "Importing...",
    sheetsError: "Could not access Google Sheet. Make sure it is shared publicly.",
    fileTooLarge: "File is too large. Maximum size is 5MB.",
    fileWrongType: "Only PDF files are accepted.",
    privacy: "Your CV is processed in real-time and never stored.",
    fromFile: "from file",
  },
  es: {
    tabText: "Pegar texto",
    tabFile: "Subir PDF",
    tabSheets: "Google Sheets",
    labelCv: "Tu curr\u00edculum",
    placeholderCv: "Pega el texto de tu curr\u00edculum aqu\u00ed...",
    chars: "caracteres",
    maxPages: "M\u00e1ximo ~5 p\u00e1ginas",
    labelRole: "Puesto objetivo",
    optional: "opcional",
    placeholderRole: "ej. Product Manager, Ingeniero de Software...",
    uploadTitle: "Arrastra tu PDF aqu\u00ed",
    uploadOr: "o",
    uploadButton: "Buscar archivo",
    uploadHint: "Solo PDF \u2014 m\u00e1x 5MB",
    uploadWordHint: "\u00bfTu CV es Word? Gu\u00e1rdalo como PDF primero.",
    parsing: "Leyendo tu archivo...",
    parseError: "No se pudo leer el archivo. Intenta pegando tu curr\u00edculum.",
    uploadSuccess: "Archivo cargado correctamente",
    changeFile: "Cambiar archivo",
    clearText: "Limpiar",
    sheetsLabel: "Enlace de Google Sheets",
    sheetsPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    sheetsHint: "Aseg\u00farate de que est\u00e9 compartido como \"Cualquier persona con el enlace\"",
    sheetsButton: "Importar de Google Sheets",
    sheetsLoading: "Importando...",
    sheetsError: "No se pudo acceder al Google Sheet. Aseg\u00farate de que est\u00e9 compartido.",
    fileTooLarge: "El archivo es muy grande. M\u00e1ximo 5MB.",
    fileWrongType: "Solo se aceptan archivos PDF.",
    privacy: "Tu CV se procesa en tiempo real y nunca se almacena.",
    fromFile: "de archivo",
  },
};

export default function CVInput({
  cvText,
  setCvText,
  targetRole,
  setTargetRole,
  onSubmit,
  loading,
  error,
  setError,
  isEs,
  submitLabel,
  loadingLabel,
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
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setUploading(true);
      setError(null);
      setFileName(file.name);
      setFileLoaded(false);

      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/parse", { method: "POST", body: form });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || t.parseError);
          setFileName("");
          setUploading(false);
          return;
        }

        setCvText(data.text);
        setFileLoaded(true);
      } catch {
        setError(t.parseError);
        setFileName("");
      } finally {
        setUploading(false);
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

      if (!res.ok) {
        setError(data.error || t.sheetsError);
        setSheetsLoading(false);
        return;
      }

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
    setCvText("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const tabs: { mode: InputMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: "file",
      label: t.tabFile,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      ),
    },
    {
      mode: "text",
      label: t.tabText,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      mode: "sheets",
      label: t.tabSheets,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 12c.621 0 1.125.504 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-2.25 0c-.621 0-1.125.504-1.125 1.125" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map(({ mode, label, icon }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setInputMode(mode)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
              inputMode === mode
                ? "text-accent border-b-2 border-accent -mb-px"
                : "text-muted hover:text-gray-900"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* \u2500\u2500 File Upload \u2500\u2500 */}
      {inputMode === "file" && (
        <div>
          {/* Success state */}
          {fileLoaded && fileName ? (
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-lg p-6">
              <div className="flex items-center gap-4">
                {/* File icon */}
                <div className="shrink-0 w-12 h-12 rounded-lg bg-white border border-emerald-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 18h10v-2H7v2zM7 14h10v-2H7v2zM7 10h4V8H7v2zm12-4V4c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8l-4-4h4V6z" />
                    <text x="7" y="21" fontSize="7" fontWeight="bold" fill="currentColor">PDF</text>
                  </svg>
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-emerald-700">{t.uploadSuccess}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-0.5">{fileName}</p>
                </div>

                {/* Change file button */}
                <button
                  type="button"
                  onClick={resetFile}
                  className="shrink-0 text-sm text-muted hover:text-gray-900 font-medium transition cursor-pointer"
                >
                  {t.changeFile}
                </button>
              </div>
            </div>
          ) : (
            /* Upload zone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-accent bg-accent-light scale-[1.01]"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                  <p className="text-sm text-muted">{t.parsing}</p>
                </div>
              ) : (
                <>
                  {/* Upload icon */}
                  <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${
                    dragOver ? "bg-accent/10" : "bg-gray-100"
                  }`}>
                    <svg
                      className={`h-6 w-6 transition-colors ${dragOver ? "text-accent" : "text-gray-400"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </div>

                  <p className="text-sm font-medium text-gray-700 mb-1">{t.uploadTitle}</p>
                  <p className="text-xs text-muted mb-3">
                    {t.uploadOr}{" "}
                    <span className="text-accent font-medium">{t.uploadButton.toLowerCase()}</span>
                  </p>

                  <div className="flex items-center justify-center gap-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      {t.uploadHint}
                    </span>
                  </div>

                  <p className="text-xs text-muted/70 mt-2">{t.uploadWordHint}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* \u2500\u2500 Text Input \u2500\u2500 */}
      {inputMode === "text" && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="cv-input" className="block text-sm font-medium">
              {t.labelCv}
            </label>
            {cvText.length > 0 && (
              <button
                type="button"
                onClick={() => { setCvText(""); setFileName(""); setFileLoaded(false); }}
                className="text-xs text-muted hover:text-gray-900 transition cursor-pointer"
              >
                {t.clearText}
              </button>
            )}
          </div>
          <textarea
            id="cv-input"
            rows={10}
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder={t.placeholderCv}
            className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y transition placeholder:text-gray-400"
            required
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted">
              {cvText.length > 0
                ? `${cvText.length.toLocaleString()} ${t.chars}`
                : ""}
              {fileName ? ` \u2014 ${fileName}` : ""}
            </span>
            <span className="text-xs text-muted">{t.maxPages}</span>
          </div>
        </div>
      )}

      {/* \u2500\u2500 Google Sheets \u2500\u2500 */}
      {inputMode === "sheets" && (
        <div className="space-y-3">
          <div>
            <label htmlFor="sheets-url-input" className="block text-sm font-medium mb-1.5">
              {t.sheetsLabel}
            </label>
            <input
              id="sheets-url-input"
              type="url"
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
              placeholder={t.sheetsPlaceholder}
              className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition placeholder:text-gray-400"
            />
            <p className="text-xs text-muted mt-1.5">{t.sheetsHint}</p>
          </div>
          <button
            type="button"
            onClick={handleSheetsImport}
            disabled={sheetsLoading || !sheetsUrl.trim()}
            className="w-full bg-accent text-white font-medium py-3 px-6 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {sheetsLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t.sheetsLoading}
              </span>
            ) : (
              t.sheetsButton
            )}
          </button>
        </div>
      )}

      {/* Target role \u2014 always visible */}
      <div>
        <label htmlFor="target-role" className="block text-sm font-medium mb-1.5">
          {t.labelRole}{" "}
          <span className="text-muted font-normal">({t.optional})</span>
        </label>
        <input
          id="target-role"
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder={t.placeholderRole}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition placeholder:text-gray-400"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || cvText.trim().length < 50}
        className="w-full bg-accent text-white font-medium py-3 px-6 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {loadingLabel}
          </span>
        ) : (
          submitLabel
        )}
      </button>

      {/* Privacy note */}
      <p className="text-center text-xs text-muted">{t.privacy}</p>
    </div>
  );
}

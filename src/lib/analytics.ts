import { track } from "@vercel/analytics";

/**
 * MaxCV Analytics — Conversion funnel events
 *
 * Funnel: visit → input → analyze → result → copy → donate
 *
 * All events use Vercel Analytics track() which is already
 * included via <Analytics /> in layout.tsx. No extra deps needed.
 */

export const analytics = {
  /** User pasted CV text into textarea */
  cvPasted: (charCount: number) =>
    track("cv_pasted", { char_count: charCount }),

  /** User uploaded a PDF file */
  pdfUploaded: (fileSize: number) =>
    track("pdf_uploaded", { file_size_kb: Math.round(fileSize / 1024) }),

  /** PDF was successfully parsed */
  pdfParsed: (charCount: number) =>
    track("pdf_parsed", { char_count: charCount }),

  /** PDF parsing failed */
  pdfError: () =>
    track("pdf_error"),

  /** User clicked Analyze button */
  analysisStarted: (inputMethod: "paste" | "pdf", hasTargetRole: boolean) =>
    track("analysis_started", { input_method: inputMethod, has_target_role: hasTargetRole }),

  /** Analysis completed successfully */
  analysisCompleted: (score: number, lang: string) =>
    track("analysis_completed", { score, language: lang }),

  /** Analysis failed */
  analysisError: (reason: string) =>
    track("analysis_error", { reason }),

  /** User copied improved CV text */
  cvCopied: () =>
    track("cv_copied"),

  /** User clicked donation button */
  donationClicked: (provider: "stripe" | "paypal") =>
    track("donation_clicked", { provider }),

  /** User clicked "try again" to reset */
  resetClicked: () =>
    track("reset_clicked"),
};

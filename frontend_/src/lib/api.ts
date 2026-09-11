export const API_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "") ||
  "/api";

export type CallAnalysis = {
  call_purpose?: string;
  customer_issue?: string;
  resolution_status?: string;
  actions_taken_by_agent?: string;
  next_steps?: string;
  summary_from_customer_perspective?: string;
  summary_from_agent_perspective?: string;
  [key: string]: unknown;
};

/** Read a field from the analysis object, tolerating naming variations. */
export function analysisField(
  analysis: CallAnalysis | undefined,
  keys: string[],
): string | undefined {
  if (!analysis) return undefined;
  const entries = Object.entries(analysis);
  for (const key of keys) {
    const target = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
    for (const [k, v] of entries) {
      if (k.replace(/[^a-z0-9]/gi, "").toLowerCase() !== target) continue;
      const text = stringify(v);
      if (text) return text;
    }
  }
  return undefined;
}

function stringify(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    const parts = value.map((v) => stringify(v)).filter(Boolean) as string[];
    return parts.length ? parts.map((p) => `• ${p}`).join("\n") : undefined;
  }
  if (value && typeof value === "object") {
    const parts = Object.entries(value)
      .map(([k, v]) => {
        const s = stringify(v);
        return s ? `${k.replace(/_/g, " ")}: ${s}` : undefined;
      })
      .filter(Boolean) as string[];
    return parts.length ? parts.join("\n") : undefined;
  }
  return undefined;
}

export type AnalyzeResponse = {
  transcript?: string | Array<{ speaker?: string; text?: string }> | unknown;
  analysis?: CallAnalysis;
  [key: string]: unknown;
};

/** GET / — used purely as a backend health probe. */
export async function checkBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * POST /upload-audio/ (multipart form-data).
 * Returns the server-side path that /analyze-call/ expects.
 */
export async function uploadAudio(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  let res = await fetch(`${API_URL}/upload-audio/`, { method: "POST", body: form });

  if (res.status === 422) {
    // Some builds name the field "audio_file" instead of "file".
    const alt = new FormData();
    alt.append("audio_file", file);
    res = await fetch(`${API_URL}/upload-audio/`, { method: "POST", body: alt });
  }

  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}): ${await safeText(res)}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  const path =
    data["audio_file_path"] ?? data["file_path"] ?? data["path"] ?? data["filename"] ?? data["file"];

  if (typeof path !== "string" || !path) {
    throw new Error("Upload succeeded but no file path was returned by the server.");
  }
  return path;
}

/** POST /analyze-call/?audio_file_path=<path> — exact existing contract. */
export async function analyzeCall(audioFilePath: string): Promise<AnalyzeResponse> {
  const url = `${API_URL}/analyze-call/?audio_file_path=${encodeURIComponent(audioFilePath)}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    throw new Error(`Analysis failed (${res.status}): ${await safeText(res)}`);
  }
  return (await res.json()) as AnalyzeResponse;
}

async function safeText(res: Response) {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return "unknown error";
  }
}

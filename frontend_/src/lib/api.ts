export const API_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "") ||
  "/api";


// ============================================================
// TYPES
// ============================================================

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


export type TranscriptTurn = {
  speaker?: string;
  text?: string;
};


export type AnalyzeResponse = {
  transcript?: string | TranscriptTurn[] | unknown;
  analysis?: CallAnalysis;

  [key: string]: unknown;
};


export type CallRecord = {
  id: number;

  audio_file?: string | null;

  transcript?: string | TranscriptTurn[] | null;

  analysis?: CallAnalysis | null;

  created_at?: string | null;
};


export type UploadAudioResponse = {
  message: string;
  file_path: string;
};


export type Resolution =
  | "Resolved"
  | "Unresolved"
  | "Follow-up Required";


// ============================================================
// STRINGIFY HELPER
// ============================================================

function stringify(
  value: unknown,
): string | undefined {

  if (typeof value === "string") {
    const text = value.trim();

    return text || undefined;
  }


  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }


  if (Array.isArray(value)) {

    const parts = value
      .map(stringify)
      .filter(Boolean) as string[];

    if (!parts.length) {
      return undefined;
    }

    return parts
      .map((part) => `• ${part}`)
      .join("\n");
  }


  if (
    value &&
    typeof value === "object"
  ) {

    const parts = Object.entries(value)
      .map(([key, item]) => {

        const text = stringify(item);

        if (!text) {
          return undefined;
        }

        return `${key.replace(
          /_/g,
          " ",
        )}: ${text}`;
      })
      .filter(Boolean) as string[];

    if (!parts.length) {
      return undefined;
    }

    return parts.join("\n");
  }


  return undefined;
}


// ============================================================
// ANALYSIS FIELD
// ============================================================

export function analysisField(
  analysis:
    | CallAnalysis
    | undefined
    | null,

  keys: string[],
): string | undefined {

  if (!analysis) {
    return undefined;
  }


  const entries =
    Object.entries(analysis);


  for (const key of keys) {

    const target =
      key
        .replace(
          /[^a-z0-9]/gi,
          "",
        )
        .toLowerCase();


    for (
      const [actualKey, value]
      of entries
    ) {

      const normalizedActual =
        actualKey
          .replace(
            /[^a-z0-9]/gi,
            "",
          )
          .toLowerCase();


      if (
        normalizedActual !== target
      ) {
        continue;
      }


      const text =
        stringify(value);


      if (text) {
        return text;
      }
    }
  }


  return undefined;
}


// ============================================================
// RESOLUTION
// ============================================================

export function normalizeResolution(
  value?: string | null,
): Resolution {

  const text =
    (value ?? "")
      .trim()
      .toLowerCase();


  if (
    text.includes("follow")
  ) {
    return "Follow-up Required";
  }


  if (
    text.includes("resolved") ||
    text === "yes" ||
    text === "true"
  ) {
    return "Resolved";
  }


  return "Unresolved";
}


// ============================================================
// CALL PURPOSE
// ============================================================

export function getCallPurpose(
  call: CallRecord,
): string {

  return (
    analysisField(
      call.analysis ?? undefined,
      [
        "call_purpose",
        "purpose",
        "call_reason",
        "reason",
      ],
    ) || "Not provided"
  );
}


// ============================================================
// AUDIO FILE NAME
// ============================================================

export function getAudioFileName(
  call: CallRecord,
): string {

  const path =
    call.audio_file ?? "";


  if (!path) {
    return "Audio file";
  }


  return (
    path.split(/[\\/]/).pop() ||
    path
  );
}


// ============================================================
// DATE
// ============================================================

export function getCallDate(
  createdAt?: string | null,
): string {

  if (!createdAt) {
    return "";
  }


  const date =
    new Date(createdAt);


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return createdAt.slice(0, 10);
  }


  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, "0");


  const day =
    String(
      date.getDate(),
    ).padStart(2, "0");


  return `${year}-${month}-${day}`;
}


// ============================================================
// FORMATTED DATE
// ============================================================

export function formatCallDate(
  createdAt?: string | null,
): string {

  if (!createdAt) {
    return "—";
  }


  const date =
    new Date(createdAt);


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return createdAt;
  }


  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}


// ============================================================
// BACKEND CHECK
// ============================================================

export async function checkBackend(): Promise<boolean> {

  try {

    const response =
      await fetch(
        `${API_URL}/`,
        {
          method: "GET",
        },
      );


    return response.ok;

  } catch {

    return false;
  }
}


// ============================================================
// UPLOAD AUDIO
// ============================================================

export async function uploadAudio(
  file: File,
): Promise<UploadAudioResponse> {

  if (!file) {
    throw new Error(
      "No audio file selected.",
    );
  }


  const formData =
    new FormData();


  formData.append(
    "file",
    file,
  );


  const response =
    await fetch(
      `${API_URL}/upload-audio/`,
      {
        method: "POST",
        body: formData,
      },
    );


  if (!response.ok) {

    let message =
      `Upload failed (${response.status}).`;


    try {

      const errorData =
        await response.json();


      if (
        errorData?.detail
      ) {
        message =
          String(
            errorData.detail,
          );
      }

    } catch {
      // Keep default error message.
    }


    throw new Error(
      message,
    );
  }


  const data =
    (await response.json()) as Record<
      string,
      unknown
    >;


  /*
   * The FastAPI backend returns:
   *
   * {
   *   "message": "Audio uploaded successfully",
   *   "file_path": "C:\\...\\file.mp3"
   * }
   */


  const filePath =
    data["file_path"];


  if (
    typeof filePath !== "string" ||
    !filePath.trim()
  ) {

    throw new Error(
      "Audio uploaded successfully, but the backend did not return file_path.",
    );
  }


  return {
    message:
      typeof data["message"] ===
      "string"
        ? data["message"]
        : "Audio uploaded successfully",

    file_path:
      filePath,
  };
}


// ============================================================
// ANALYZE CALL
// ============================================================

export async function analyzeCall(
  audioFilePath: string,
): Promise<AnalyzeResponse> {

  if (
    typeof audioFilePath !== "string" ||
    !audioFilePath.trim()
  ) {

    throw new Error(
      "Audio file path is missing.",
    );
  }


  const params =
    new URLSearchParams();


  params.set(
    "audio_file_path",
    audioFilePath,
  );


  const response =
    await fetch(
      `${API_URL}/analyze-call/?${params.toString()}`,
      {
        method: "POST",
      },
    );


  if (!response.ok) {

    let message =
      `Analysis failed (${response.status}).`;


    try {

      const errorData =
        await response.json();


      if (
        errorData?.detail
      ) {
        message =
          String(
            errorData.detail,
          );
      }

    } catch {
      // Keep default error message.
    }


    throw new Error(
      message,
    );
  }


  return (
    await response.json()
  ) as AnalyzeResponse;
}


// ============================================================
// GET ALL CALLS
// ============================================================

export async function getCalls(): Promise<
  CallRecord[]
> {

  const response =
    await fetch(
      `${API_URL}/calls/`,
      {
        method: "GET",
      },
    );


  if (!response.ok) {

    throw new Error(
      `Failed to load calls (${response.status}): ${await safeText(
        response,
      )}`,
    );
  }


  const data =
    (await response.json()) as {
      calls?: CallRecord[];
    };


  return Array.isArray(
    data.calls,
  )
    ? data.calls
    : [];
}


// ============================================================
// GET ONE CALL
// ============================================================

export async function getCall(
  callId: number,
): Promise<CallRecord> {

  const response =
    await fetch(
      `${API_URL}/calls/${callId}`,
      {
        method: "GET",
      },
    );


  if (!response.ok) {

    throw new Error(
      `Failed to load call (${response.status}): ${await safeText(
        response,
      )}`,
    );
  }


  return (
    await response.json()
  ) as CallRecord;
}


// ============================================================
// CALL AUDIO URL
// ============================================================

export function getCallAudioUrl(
  callId: number,
): string {

  return (
    `${API_URL}/calls/${callId}/audio`
  );
}


// ============================================================
// DAILY ACTIVITY
// ============================================================

export function buildDailyActivity(
  calls: CallRecord[],
  numberOfDays = 7,
) {

  const now =
    new Date();


  const result: {
    day: string;
    calls: number;
    analyzed: number;
  }[] = [];


  for (
    let i = numberOfDays - 1;
    i >= 0;
    i--
  ) {

    const date =
      new Date(now);


    date.setHours(
      0,
      0,
      0,
      0,
    );


    date.setDate(
      date.getDate() - i,
    );


    const key =
      getCallDate(
        date.toISOString(),
      );


    const count =
      calls.filter(
        (call) =>
          getCallDate(
            call.created_at,
          ) === key,
      ).length;


    result.push({
      day:
        date.toLocaleDateString(
          undefined,
          {
            weekday: "short",
          },
        ),

      calls: count,

      analyzed: count,
    });
  }


  return result;
}


// ============================================================
// MONTHLY VOLUME
// ============================================================

export function buildMonthlyVolume(
  calls: CallRecord[],
  numberOfMonths = 6,
) {

  const now =
    new Date();


  const result: {
    month: string;
    calls: number;
    analyzed: number;
  }[] = [];


  for (
    let i = numberOfMonths - 1;
    i >= 0;
    i--
  ) {

    const date =
      new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1,
      );


    const year =
      date.getFullYear();


    const month =
      date.getMonth();


    const count =
      calls.filter(
        (call) => {

          if (!call.created_at) {
            return false;
          }


          const callDate =
            new Date(
              call.created_at,
            );


          return (
            callDate.getFullYear() ===
              year &&
            callDate.getMonth() ===
              month
          );
        },
      ).length;


    result.push({
      month:
        date.toLocaleDateString(
          undefined,
          {
            month: "short",
          },
        ),

      calls: count,

      analyzed: count,
    });
  }


  return result;
}


// ============================================================
// SAFE RESPONSE TEXT
// ============================================================

async function safeText(
  response: Response,
): Promise<string> {

  try {

    return (
      await response.text()
    ).slice(0, 500);

  } catch {

    return "Unknown server error.";
  }
}
export type TranscriptTurn = { speaker: string | null; text: string };

const SPEAKER_RE = /^\s*(agent|customer|caller|client|support|speaker\s*[a-z0-9]+|[a-z]+)\s*[:\-–]\s*/i;

/** Turn a raw transcript string into readable conversation turns. */
export function parseTranscript(raw: string): TranscriptTurn[] {
  const text = (raw ?? "").trim();
  if (!text) return [];

  const lines = text
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const turns: TranscriptTurn[] = [];
  for (const line of lines) {
    const m = line.match(SPEAKER_RE);
    if (m && m[1] && m[1].length <= 24) {
      turns.push({ speaker: normalize(m[1]), text: line.slice(m[0].length).trim() });
    } else if (turns.length && turns[turns.length - 1]!.speaker) {
      turns[turns.length - 1]!.text += ` ${line}`;
    } else {
      turns.push({ speaker: null, text: line });
    }
  }

  if (turns.length === 1 && !turns[0]!.speaker) {
    // Single blob: split into readable paragraphs by sentence groups.
    const sentences = turns[0]!.text.match(/[^.!?]+[.!?]*/g) ?? [turns[0]!.text];
    const paras: string[] = [];
    for (let i = 0; i < sentences.length; i += 3) {
      paras.push(sentences.slice(i, i + 3).join(" ").trim());
    }
    return paras.filter(Boolean).map((p) => ({ speaker: null, text: p }));
  }

  return turns;
}

function normalize(label: string) {
  const l = label.trim().toLowerCase();
  if (l.startsWith("agent") || l.startsWith("support")) return "AGENT";
  if (l.startsWith("customer") || l.startsWith("caller") || l.startsWith("client"))
    return "Customer";
  if (l.startsWith("speaker")) {
    const id = l.replace(/speaker\s*/, "").toUpperCase();
    return id === "A" || id === "0" || id === "1" ? "AGENT" : "Customer";
  }
  return label.trim();
}

export function isAgent(speaker: string | null) {
  return speaker?.toUpperCase() === "AGENT";
}

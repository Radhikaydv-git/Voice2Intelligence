import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
  AudioLines,
  BadgeCheck,
  Bot,
  CheckCircle2,
  CloudUpload,
  Database,
  FileAudio,
  Loader2,
  MessageSquareText,
  RotateCcw,
  Trash2,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import {
  analyzeCall,
  analysisField,
  uploadAudio,
  type AnalyzeResponse,
} from "@/lib/api";

import { isAgent, parseTranscript } from "@/lib/transcript";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      {
        title: "Analyze a Call — TeleXpert Indore AI Call Analyzer",
      },
      {
        name: "description",
        content:
          "Upload an MP3 or WAV customer conversation and get an AI transcript plus agent actions, next steps and summaries.",
      },
      {
        property: "og:title",
        content: "Analyze a Call — TeleXpert Indore",
      },
      {
        property: "og:description",
        content:
          "Upload a customer conversation and get AI-powered insights.",
      },
    ],
  }),

  component: AnalyzePage,
});

const steps = [
  {
    key: "upload",
    label: "Uploading audio",
    icon: CloudUpload,
  },
  {
    key: "transcribe",
    label: "Transcribing conversation",
    icon: MessageSquareText,
  },
  {
    key: "analyze",
    label: "Analyzing with AI",
    icon: Bot,
  },
  {
    key: "save",
    label: "Saving results",
    icon: Database,
  },
] as const;

type Stage = "idle" | "processing" | "done" | "error";

function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = useCallback((next: File | null) => {
    if (!next) return;

    const ok =
      /\.(mp3|wav)$/i.test(next.name) ||
      /audio\/(mpeg|mp3|wav|x-wav)/.test(next.type);

    if (!ok) {
      toast.error("Unsupported file", {
        description: "Please choose an MP3 or WAV file.",
      });
      return;
    }

    setAudioUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }

      return URL.createObjectURL(next);
    });

    setFile(next);
    setResult(null);
    setError(null);
    setStage("idle");
  }, []);

  const clearFile = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setFile(null);
    setResult(null);
    setError(null);
    setStage("idle");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  async function runAnalysis() {
    if (!file) return;

    setStage("processing");
    setStepIndex(0);
    setError(null);
    setResult(null);

    try {
      // Step 1: Upload the audio to the existing FastAPI backend.
      const path = await uploadAudio(file);

      setStepIndex(1);

      // Visual progress indicator.
      const timer = setTimeout(() => {
        setStepIndex(2);
      }, 1200);

      // Step 2: Analyze using the existing backend.
      const data = await analyzeCall(path);

      clearTimeout(timer);

      setStepIndex(3);

      // Store the complete backend response.
      setResult(data);
      setStage("done");

      toast.success("Analysis complete", {
        description: file.name,
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unexpected error";

      setError(message);
      setStage("error");

      toast.error("Analysis failed", {
        description: message,
      });
    }
  }

  return (
    <div className="page-enter mx-auto flex w-full max-w-5xl flex-col gap-6">
      {stage === "done" && result ? (
        <ResultView
          result={result}
          fileName={file?.name ?? "audio file"}
          onReset={clearFile}
          onRerun={runAnalysis}
        />
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Analyze a Call
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Upload a customer conversation and get AI-powered insights.
            </p>
          </div>

          <section className="panel p-6 md:p-8">
            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);

                  pickFile(e.dataTransfer.files?.[0] ?? null);
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border px-6 py-16 text-center transition-colors",
                  dragging && "border-primary bg-primary-soft",
                )}
              >
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <CloudUpload className="size-7" />
                </span>

                <div>
                  <p className="text-base font-semibold">
                    Drag & drop your audio file here
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Supported formats: MP3, WAV
                  </p>
                </div>

                <Button onClick={() => inputRef.current?.click()}>
                  <FileAudio className="size-4" />
                  Choose Audio
                </Button>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".mp3,.wav,audio/mpeg,audio/wav"
                  className="hidden"
                  onChange={(e) =>
                    pickFile(e.target.files?.[0] ?? null)
                  }
                />
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-muted/50 p-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-cyan-soft text-cyan">
                    <AudioLines className="size-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {file.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFile}
                    disabled={stage === "processing"}
                    aria-label="Remove selected file"
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                </div>

                {audioUrl ? (
                  <audio controls src={audioUrl} className="w-full">
                    <track kind="captions" />
                  </audio>
                ) : null}

                {stage === "processing" ? (
                  <ProcessingPanel stepIndex={stepIndex} />
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={runAnalysis} size="lg">
                      <Bot className="size-4" />
                      Analyze Call
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => inputRef.current?.click()}
                    >
                      Choose another file
                    </Button>

                    <input
                      ref={inputRef}
                      type="file"
                      accept=".mp3,.wav,audio/mpeg,audio/wav"
                      className="hidden"
                      onChange={(e) =>
                        pickFile(e.target.files?.[0] ?? null)
                      }
                    />
                  </div>
                )}

                {stage === "error" && error ? (
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-destructive-soft p-4">
                    <TriangleAlert className="mt-0.5 size-5 text-destructive" />

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-destructive">
                        We couldn't analyze this call
                      </p>

                      <p className="mt-1 break-words text-sm text-muted-foreground">
                        {error}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function ProcessingPanel({
  stepIndex,
}: {
  stepIndex: number;
}) {
  const progress = Math.round(
    ((stepIndex + 0.5) / steps.length) * 100,
  );

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-5">
      <div className="flex items-center gap-3">
        <Loader2 className="size-4 animate-spin text-primary" />

        <p className="text-sm font-semibold">
          Processing your call…
        </p>
      </div>

      <Progress value={progress} className="mt-4 h-2" />

      <ul className="mt-5 flex flex-col gap-3">
        {steps.map((step, i) => {
          const state =
            i < stepIndex
              ? "done"
              : i === stepIndex
                ? "active"
                : "pending";

          return (
            <li
              key={step.key}
              className="flex items-center gap-3"
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  state === "done"
                    ? "bg-success-soft text-success"
                    : state === "active"
                      ? "bg-primary-soft text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {state === "done" ? (
                  <CheckCircle2 className="size-4" />
                ) : state === "active" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <step.icon className="size-4" />
                )}
              </span>

              <span
                className={cn(
                  "text-sm",
                  state === "pending"
                    ? "text-muted-foreground"
                    : "font-medium",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-col gap-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function ResultView({
  result,
  fileName,
  onReset,
  onRerun,
}: {
  result: AnalyzeResponse;
  fileName: string;
  onReset: () => void;
  onRerun: () => void;
}) {
  const analysis = result.analysis ?? {};

  /*
   * IMPORTANT FIX:
   *
   * The FastAPI backend returns transcript as an array:
   *
   * [
   *   {
   *     speaker: "A",
   *     text: "Hello..."
   *   },
   *   {
   *     speaker: "B",
   *     text: "Hi..."
   *   }
   * ]
   *
   * The previous frontend only accepted a string and therefore
   * converted the array into an empty string.
   *
   * We now support BOTH:
   * 1. Array transcript from the current backend
   * 2. String transcript as a fallback
   */

  const rawTranscript = (
    result as unknown as {
      transcript?: unknown;
    }
  ).transcript;

  const turns = Array.isArray(rawTranscript)
    ? rawTranscript
        .filter(
          (
            item,
          ): item is {
            speaker?: string;
            text?: string;
          } =>
            typeof item === "object" &&
            item !== null &&
            ("text" in item || "speaker" in item),
        )
        .map((item) => ({
          speaker: item.speaker ?? "",
          text: item.text ?? "",
        }))
        .filter(
          (item) => item.text.trim().length > 0,
        )
    : typeof rawTranscript === "string"
      ? parseTranscript(rawTranscript)
      : [];

  const purpose = analysisField(analysis, [
    "call_purpose",
    "purpose",
    "call_reason",
    "reason",
  ]);

  const issue = analysisField(analysis, [
    "customer_issue",
    "issue",
    "customer_problem",
    "problem",
    "customer_concern",
  ]);

  const resolution = analysisField(analysis, [
    "resolution_status",
    "resolution",
    "status",
    "call_resolved",
    "is_resolved",
  ]);

  const actions = analysisField(analysis, [
    "actions_taken_by_agent",
    "agent_actions",
    "actions",
  ]);

  const nextSteps = analysisField(analysis, [
    "next_steps",
    "follow_up",
    "followup",
    "next_step",
  ]);

  const customerSummary = analysisField(analysis, [
    "summary_from_customer_perspective",
    "customer_summary",
    "customer_perspective",
  ]);

  const agentSummary = analysisField(analysis, [
    "summary_from_agent_perspective",
    "agent_summary",
    "agent_perspective",
  ]);

  const insights = [
    {
      title: "Actions Taken by Agent",
      value: actions,
      icon: BadgeCheck,
    },
    {
      title: "Next Steps",
      value: nextSteps,
      icon: RotateCcw,
    },
    {
      title: "Customer Perspective Summary",
      value: customerSummary,
      icon: UserRound,
    },
    {
      title: "Agent Perspective Summary",
      value: agentSummary,
      icon: Bot,
    },
  ].filter(
    (item) =>
      typeof item.value === "string" &&
      item.value.trim().length > 0,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Call Analysis
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <FileAudio className="size-4" />
              {fileName}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
              <CheckCircle2 className="size-3.5" />
              Analysis completed
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onRerun}
          >
            <RotateCcw className="size-4" />
            Re-analyze
          </Button>

          <Button onClick={onReset}>
            <CloudUpload className="size-4" />
            New call
          </Button>
        </div>
      </div>

      {/* Overview cards */}
      <section className="grid gap-4 sm:grid-cols-2">
        <OverviewCard
          title="Call Purpose"
          value={purpose}
          icon={MessageSquareText}
        />

        <OverviewCard
          title="Customer Issue"
          value={issue}
          icon={UserRound}
        />

        <OverviewCard
          title="Resolution Status"
          value={resolution}
          icon={BadgeCheck}
        />

        <OverviewCard
          title="Next Steps"
          value={nextSteps}
          icon={RotateCcw}
        />
      </section>

      {/* Transcript */}
      <section className="panel overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">
            Conversation Transcript
          </h2>

          <p className="text-xs text-muted-foreground">
            Generated from the uploaded recording
          </p>
        </div>

        {turns.length ? (
          <ScrollArea className="h-[420px]">
            <div className="flex flex-col gap-4 p-5">
              {turns.map((turn, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-xl border border-border p-4",
                    turn.speaker
                      ? isAgent(turn.speaker)
                        ? "bg-primary-soft"
                        : "ml-auto bg-muted/60"
                      : "bg-muted/40",
                  )}
                >
                  {turn.speaker ? (
                    <p
                      className={cn(
                        "mb-1.5 text-[11px] font-bold uppercase tracking-wider",
                        isAgent(turn.speaker)
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {turn.speaker}
                    </p>
                  ) : null}

                  <p className="text-sm leading-relaxed">
                    {turn.text}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <EmptyBlock text="No transcript was returned for this call." />
        )}
      </section>

      {/* AI Insights */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">
          AI Call Insights
        </h2>

        {insights.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((item) => (
              <article
                key={item.title}
                className="panel p-5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-cyan-soft text-cyan">
                    <item.icon className="size-[18px]" />
                  </span>

                  <h3 className="text-sm font-semibold">
                    {item.title}
                  </h3>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {item.value}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel">
            <EmptyBlock text="No insights were returned for this call." />
          </div>
        )}
      </section>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value?: string | undefined;
  icon: typeof FileAudio;
}) {
  const has =
    typeof value === "string" &&
    value.trim().length > 0;

  return (
    <article className="panel p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="size-[18px]" />
        </span>

        <h3 className="text-sm font-semibold">
          {title}
        </h3>
      </div>

      <p
        className={cn(
          "mt-3 text-sm leading-relaxed",
          has
            ? "text-muted-foreground"
            : "italic text-muted-foreground/70",
        )}
      >
        {has
          ? value
          : "Not provided by the analysis service."}
      </p>
    </article>
  );
}

function EmptyBlock({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <MessageSquareText className="size-5" />
      </span>

      <p className="text-sm text-muted-foreground">
        {text}
      </p>
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
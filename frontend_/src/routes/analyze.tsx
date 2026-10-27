import { createFileRoute } from "@tanstack/react-router";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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
  getAudioFileName,
  getCall,
  getCallAudioUrl,
  uploadAudio,
  type AnalyzeResponse,
  type CallRecord,
  type TranscriptTurn,
} from "@/lib/api";

import { isAgent } from "@/lib/transcript";
import { cn } from "@/lib/utils";


export const Route =
  createFileRoute("/analyze")({
    head: () => ({
      meta: [
        {
          title:
            "Analyze a Call — TeleXpert Indore AI Call Analyzer",
        },

        {
          name: "description",
          content:
            "Upload an MP3 or WAV customer conversation and get an AI transcript plus agent actions, next steps and summaries.",
        },

        {
          property: "og:title",
          content:
            "Analyze a Call — TeleXpert Indore",
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


type Stage =
  | "idle"
  | "loading-history"
  | "processing"
  | "done"
  | "error";


function AnalyzePage() {

  const [
    file,
    setFile,
  ] = useState<File | null>(null);


  const [
    audioUrl,
    setAudioUrl,
  ] = useState<string | null>(null);


  const [
    stage,
    setStage,
  ] = useState<Stage>("idle");


  const [
    stepIndex,
    setStepIndex,
  ] = useState(0);


  const [
    result,
    setResult,
  ] = useState<AnalyzeResponse | null>(
    null,
  );


  const [
    historicalCall,
    setHistoricalCall,
  ] = useState<CallRecord | null>(
    null,
  );


  const [
    error,
    setError,
  ] = useState<string | null>(null);


  const [
    dragging,
    setDragging,
  ] = useState(false);


  const inputRef =
    useRef<HTMLInputElement>(null);


  // ==========================================================
  // SELECT FILE
  // ==========================================================

  const pickFile =
    useCallback(
      (next: File | null) => {

        if (!next) {
          return;
        }


        const validExtension =
          /\.(mp3|wav)$/i.test(
            next.name,
          );


        const validMime =
          /audio\/(mpeg|mp3|wav|x-wav)/i.test(
            next.type,
          );


        if (
          !validExtension &&
          !validMime
        ) {

          toast.error(
            "Unsupported file",
            {
              description:
                "Please choose an MP3 or WAV file.",
            },
          );

          return;
        }


        setAudioUrl(
          (previous) => {

            if (
              previous?.startsWith(
                "blob:",
              )
            ) {
              URL.revokeObjectURL(
                previous,
              );
            }


            return URL.createObjectURL(
              next,
            );
          },
        );


        setFile(next);

        setHistoricalCall(
          null,
        );

        setResult(null);

        setError(null);

        setStage("idle");

        setStepIndex(0);
      },
      [],
    );


  // ==========================================================
  // CLEAR FILE
  // ==========================================================

  const clearFile =
    useCallback(() => {

      setAudioUrl(
        (previous) => {

          if (
            previous?.startsWith(
              "blob:",
            )
          ) {
            URL.revokeObjectURL(
              previous,
            );
          }

          return null;
        },
      );


      setFile(null);

      setHistoricalCall(null);

      setResult(null);

      setError(null);

      setStage("idle");

      setStepIndex(0);


      if (
        inputRef.current
      ) {
        inputRef.current.value = "";
      }

    }, []);


  // ==========================================================
  // LOAD HISTORICAL CALL
  // ==========================================================

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search,
      );


    const callIdText =
      params.get("callId");


    if (!callIdText) {
      return;
    }


    const callId =
      Number(callIdText);


    if (
      !Number.isInteger(callId) ||
      callId <= 0
    ) {

      setError(
        "Invalid call ID.",
      );

      setStage("error");

      return;
    }


    let cancelled = false;


    setStage(
      "loading-history",
    );


    setError(null);


    void getCall(callId)
      .then((call) => {

        if (cancelled) {
          return;
        }


        setHistoricalCall(
          call,
        );


        setResult({
          transcript:
            call.transcript ?? [],
          analysis:
            call.analysis ?? {},
        });


        setAudioUrl(
          getCallAudioUrl(
            call.id,
          ),
        );


        setStage("done");

      })
      .catch((e) => {

        if (cancelled) {
          return;
        }


        const message =
          e instanceof Error
            ? e.message
            : "Unable to load this call.";


        setError(message);

        setStage("error");


        toast.error(
          "Could not load call",
          {
            description:
              message,
          },
        );
      });


    return () => {

      cancelled = true;

    };

  }, []);


  // ==========================================================
  // RUN ANALYSIS
  // ==========================================================

  async function runAnalysis() {

    if (!file) {

      toast.error(
        "Choose an audio file first.",
      );

      return;
    }


    setStage(
      "processing",
    );

    setStepIndex(0);

    setError(null);

    setResult(null);


    try {

      // ======================================================
      // 1. UPLOAD
      // ======================================================

      const uploadResult =
        await uploadAudio(
          file,
        );


      /*
       * IMPORTANT FIX
       *
       * The backend returns:
       *
       * {
       *   message: "...",
       *   file_path: "C:\\...\\audio.mp3"
       * }
       *
       * We must use uploadResult.file_path.
       */

      const audioFilePath =
        uploadResult.file_path;


      if (
        typeof audioFilePath !==
          "string" ||
        !audioFilePath.trim()
      ) {

        throw new Error(
          "Audio uploaded successfully, but no file path was returned.",
        );
      }


      setStepIndex(1);


      // ======================================================
      // 2 + 3. TRANSCRIPTION + AI ANALYSIS
      // ======================================================

      const timer =
        window.setTimeout(
          () => {
            setStepIndex(2);
          },
          1200,
        );


      const data =
        await analyzeCall(
          audioFilePath,
        );


      window.clearTimeout(
        timer,
      );


      // ======================================================
      // 4. SAVE
      // ======================================================

      setStepIndex(3);

      setResult(data);

      setStage("done");


      toast.success(
        "Analysis complete",
        {
          description:
            file.name,
        },
      );

    } catch (e) {

      const message =
        e instanceof Error
          ? e.message
          : "Unexpected error";


      setError(message);

      setStage("error");


      toast.error(
        "Analysis failed",
        {
          description:
            message,
        },
      );
    }
  }


  // ==========================================================
  // HISTORICAL LOADING
  // ==========================================================

  if (
    stage ===
    "loading-history"
  ) {

    return (

      <div className="page-enter mx-auto flex w-full max-w-5xl flex-col gap-6">

        <div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Call Analysis
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Loading the saved transcript and AI insights…
          </p>

        </div>


        <section className="panel p-6">

          <div className="flex items-center gap-3">

            <Loader2 className="size-5 animate-spin text-primary" />

            <span className="text-sm font-medium">
              Loading call from PostgreSQL…
            </span>

          </div>

        </section>

      </div>
    );
  }


  // ==========================================================
  // RESULT
  // ==========================================================

  if (
    stage === "done" &&
    result
  ) {

    return (

      <div className="page-enter mx-auto flex w-full max-w-5xl flex-col gap-6">

        <ResultView
          result={result}
          fileName={
            historicalCall
              ? getAudioFileName(
                  historicalCall,
                )
              : file?.name ??
                "audio file"
          }
          historical={
            Boolean(
              historicalCall,
            )
          }
          onReset={
            clearFile
          }
          onRerun={
            runAnalysis
          }
        />

      </div>
    );
  }


  // ==========================================================
  // UPLOAD SCREEN
  // ==========================================================

  return (

    <div className="page-enter mx-auto flex w-full max-w-5xl flex-col gap-6">

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
            onDragOver={(event) => {

              event.preventDefault();

              setDragging(true);

            }}

            onDragLeave={() =>
              setDragging(false)
            }

            onDrop={(event) => {

              event.preventDefault();

              setDragging(false);

              pickFile(
                event.dataTransfer.files?.[0] ??
                  null,
              );

            }}

            className={cn(
              "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border px-6 py-16 text-center transition-colors",

              dragging &&
                "border-primary bg-primary-soft",
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


            <Button
              onClick={() =>
                inputRef.current?.click()
              }
            >

              <FileAudio className="size-4" />

              Choose Audio

            </Button>


            <input
              ref={inputRef}
              type="file"
              accept=".mp3,.wav,audio/mpeg,audio/wav"
              className="hidden"
              onChange={(event) =>
                pickFile(
                  event.target.files?.[0] ??
                    null,
                )
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
                onClick={
                  clearFile
                }
                disabled={
                  stage ===
                  "processing"
                }
              >

                <Trash2 className="size-4" />

                Remove

              </Button>

            </div>


            {audioUrl ? (

              <audio
                controls
                src={audioUrl}
                className="w-full"
              >
                <track kind="captions" />
              </audio>

            ) : null}


            {stage ===
            "processing" ? (

              <ProcessingPanel
                stepIndex={
                  stepIndex
                }
              />

            ) : (

              <div className="flex flex-wrap items-center gap-3">

                <Button
                  onClick={
                    runAnalysis
                  }
                  size="lg"
                >

                  <Bot className="size-4" />

                  Analyze Call

                </Button>


                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    inputRef.current?.click()
                  }
                >
                  Choose another file
                </Button>


                <input
                  ref={inputRef}
                  type="file"
                  accept=".mp3,.wav,audio/mpeg,audio/wav"
                  className="hidden"
                  onChange={(event) =>
                    pickFile(
                      event.target.files?.[0] ??
                        null,
                    )
                  }
                />

              </div>

            )}


            {stage === "error" &&
            error ? (

              <ErrorBlock
                message={
                  error
                }
              />

            ) : null}

          </div>

        )}

      </section>

    </div>
  );
}


// ============================================================
// PROCESSING PANEL
// ============================================================

function ProcessingPanel({
  stepIndex,
}: {
  stepIndex: number;
}) {

  const progress =
    Math.min(
      100,
      Math.round(
        (
          (stepIndex + 0.5) /
          steps.length
        ) * 100,
      ),
    );


  return (

    <div className="rounded-xl border border-border bg-muted/40 p-5">

      <div className="flex items-center gap-3">

        <Loader2 className="size-4 animate-spin text-primary" />

        <p className="text-sm font-semibold">
          Processing your call…
        </p>

      </div>


      <Progress
        value={progress}
        className="mt-4 h-2"
      />


      <ul className="mt-5 flex flex-col gap-3">

        {steps.map(
          (step, i) => {

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
          },
        )}

      </ul>


      <div className="mt-5 flex flex-col gap-2">

        <Skeleton className="h-3 w-3/4" />

        <Skeleton className="h-3 w-1/2" />

      </div>

    </div>
  );
}


// ============================================================
// RESULT VIEW
// ============================================================

function ResultView({
  result,
  fileName,
  historical,
  onReset,
  onRerun,
}: {
  result: AnalyzeResponse;
  fileName: string;
  historical: boolean;
  onReset: () => void;
  onRerun: () => void;
}) {

  const analysis =
    result.analysis ?? {};


  const turns =
    normalizeTurns(
      result.transcript,
    );


  const purpose =
    analysisField(
      analysis,
      [
        "call_purpose",
        "purpose",
        "call_reason",
        "reason",
      ],
    );


  const issue =
    analysisField(
      analysis,
      [
        "customer_issue",
        "issue",
        "customer_problem",
        "problem",
        "customer_concern",
      ],
    );


  const resolution =
    analysisField(
      analysis,
      [
        "resolution_status",
        "resolution",
        "status",
        "call_resolved",
        "is_resolved",
      ],
    );


  const actions =
    analysisField(
      analysis,
      [
        "actions_taken_by_agent",
        "agent_actions",
        "actions",
      ],
    );


  const nextSteps =
    analysisField(
      analysis,
      [
        "next_steps",
        "follow_up",
        "followup",
        "next_step",
      ],
    );


  const customerSummary =
    analysisField(
      analysis,
      [
        "summary_from_customer_perspective",
        "customer_summary",
        "customer_perspective",
      ],
    );


  const agentSummary =
    analysisField(
      analysis,
      [
        "summary_from_agent_perspective",
        "agent_summary",
        "agent_perspective",
      ],
    );


  const insights = [
    {
      title:
        "Actions Taken by Agent",
      value: actions,
      icon: BadgeCheck,
    },

    {
      title:
        "Next Steps",
      value: nextSteps,
      icon: RotateCcw,
    },

    {
      title:
        "Customer Perspective Summary",
      value: customerSummary,
      icon: UserRound,
    },

    {
      title:
        "Agent Perspective Summary",
      value: agentSummary,
      icon: Bot,
    },
  ].filter(
    (item) =>
      typeof item.value ===
        "string" &&
      item.value.trim()
        .length > 0,
  );


  return (

    <div className="flex flex-col gap-6">

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

              {historical
                ? "Saved analysis"
                : "Analysis completed"}

            </span>

          </div>

        </div>


        <div className="flex gap-2">

          {historical ? (

            <span className="rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
              Historical call
            </span>

          ) : (

            <Button
              variant="outline"
              onClick={
                onRerun
              }
            >

              <RotateCcw className="size-4" />

              Re-analyze

            </Button>

          )}


          <Button
            onClick={
              onReset
            }
          >

            <CloudUpload className="size-4" />

            New call

          </Button>

        </div>

      </div>


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


      <section className="panel overflow-hidden">

        <div className="border-b border-border px-5 py-4">

          <h2 className="text-base font-semibold">
            Conversation Transcript
          </h2>

          <p className="text-xs text-muted-foreground">
            Speaker-labelled transcript returned by AssemblyAI
          </p>

        </div>


        {turns.length ? (

          <ScrollArea className="h-[420px]">

            <div className="flex flex-col gap-4 p-5">

              {turns.map(
                (turn, i) => {

                  const agentSpeaker =
                    turn.speaker
                      ? isAgent(
                          turn.speaker,
                        )
                      : false;


                  return (

                    <div
                      key={i}
                      className={cn(
                        "max-w-[85%] rounded-xl border border-border p-4",

                        turn.speaker
                          ? agentSpeaker
                            ? "bg-primary-soft"
                            : "ml-auto bg-muted/60"
                          : "bg-muted/40",
                      )}
                    >

                      {turn.speaker ? (

                        <p
                          className={cn(
                            "mb-1.5 text-[11px] font-bold uppercase tracking-wider",

                            agentSpeaker
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
                  );
                },
              )}

            </div>

          </ScrollArea>

        ) : (

          <EmptyBlock
            text="No transcript was returned for this call."
          />

        )}

      </section>


      <section className="flex flex-col gap-4">

        <h2 className="text-lg font-semibold">
          AI Call Insights
        </h2>


        {insights.length ? (

          <div className="grid gap-4 md:grid-cols-2">

            {insights.map(
              (item) => {

                const Icon =
                  item.icon;


                return (

                  <article
                    key={item.title}
                    className="panel p-5"
                  >

                    <div className="flex items-center gap-2.5">

                      <span className="flex size-9 items-center justify-center rounded-lg bg-cyan-soft text-cyan">

                        <Icon className="size-[18px]" />

                      </span>


                      <h3 className="text-sm font-semibold">
                        {item.title}
                      </h3>

                    </div>


                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {item.value}
                    </p>

                  </article>

                );
              },
            )}

          </div>

        ) : (

          <div className="panel">

            <EmptyBlock
              text="No insights were returned for this call."
            />

          </div>

        )}

      </section>

    </div>
  );
}


// ============================================================
// TRANSCRIPT NORMALIZATION
// ============================================================

function normalizeTurns(
  raw:
    AnalyzeResponse["transcript"],
): TranscriptTurn[] {

  if (Array.isArray(raw)) {

    return raw
      .filter(
        (
          item,
        ): item is TranscriptTurn =>
          typeof item === "object" &&
          item !== null,
      )
      .map((item) => ({
        speaker:
          typeof item.speaker ===
          "string"
            ? item.speaker
            : "",

        text:
          typeof item.text ===
          "string"
            ? item.text.trim()
            : "",
      }))
      .filter(
        (item) =>
          item.text.length > 0,
      );
  }


  if (
    typeof raw === "string"
  ) {

    return raw
      .split(/\n+/)
      .map(
        (line) =>
          line.trim(),
      )
      .filter(Boolean)
      .map((line) => {

        const match =
          line.match(
            /^([A-Za-z0-9 _-]+):\s*(.*)$/,
          );


        if (match) {

          return {
            speaker:
              match[1].trim(),

            text:
              match[2].trim(),
          };
        }


        return {
          speaker: "",
          text: line,
        };
      });
  }


  return [];
}


// ============================================================
// OVERVIEW CARD
// ============================================================

function OverviewCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value?: string;
  icon: typeof FileAudio;
}) {

  const hasValue =
    typeof value ===
      "string" &&
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

          hasValue
            ? "text-muted-foreground"
            : "italic text-muted-foreground/70",
        )}
      >
        {hasValue
          ? value
          : "Not provided by the analysis service."}
      </p>

    </article>
  );
}


// ============================================================
// EMPTY BLOCK
// ============================================================

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


// ============================================================
// ERROR BLOCK
// ============================================================

function ErrorBlock({
  message,
}: {
  message: string;
}) {

  return (

    <div className="flex items-start gap-3 rounded-xl border border-border bg-destructive-soft p-4">

      <TriangleAlert className="mt-0.5 size-5 text-destructive" />

      <div className="min-w-0">

        <p className="text-sm font-semibold text-destructive">
          We couldn't analyze this call
        </p>

        <p className="mt-1 break-words text-sm text-muted-foreground">
          {message}
        </p>

      </div>

    </div>
  );
}


// ============================================================
// FILE SIZE
// ============================================================

function formatSize(
  bytes: number,
): string {

  if (bytes < 1024) {
    return `${bytes} B`;
  }


  if (
    bytes <
    1024 * 1024
  ) {

    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }


  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}
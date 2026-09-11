export type Resolution = "Resolved" | "Unresolved" | "Follow-up Required";

export type DemoCall = {
  id: string;
  audioFile: string;
  purpose: string;
  resolution: Resolution;
  date: string;
};

export const demoCalls: DemoCall[] = [
  {
    id: "CL-10428",
    audioFile: "broadband_complaint_0412.mp3",
    purpose: "Broadband speed complaint",
    resolution: "Resolved",
    date: "2026-09-08",
  },
  {
    id: "CL-10427",
    audioFile: "billing_dispute_2201.wav",
    purpose: "Billing dispute",
    resolution: "Follow-up Required",
    date: "2026-09-08",
  },
  {
    id: "CL-10426",
    audioFile: "new_connection_enquiry.mp3",
    purpose: "New connection enquiry",
    resolution: "Resolved",
    date: "2026-09-07",
  },
  {
    id: "CL-10425",
    audioFile: "plan_upgrade_request.mp3",
    purpose: "Plan upgrade request",
    resolution: "Resolved",
    date: "2026-09-07",
  },
  {
    id: "CL-10424",
    audioFile: "router_replacement.wav",
    purpose: "Router replacement",
    resolution: "Unresolved",
    date: "2026-09-06",
  },
  {
    id: "CL-10423",
    audioFile: "installation_delay.mp3",
    purpose: "Installation delay escalation",
    resolution: "Follow-up Required",
    date: "2026-09-06",
  },
  {
    id: "CL-10422",
    audioFile: "cancellation_request.wav",
    purpose: "Service cancellation",
    resolution: "Unresolved",
    date: "2026-09-05",
  },
  {
    id: "CL-10421",
    audioFile: "static_ip_setup.mp3",
    purpose: "Static IP configuration",
    resolution: "Resolved",
    date: "2026-09-05",
  },
];

export const activitySeries = [
  { day: "Mon", calls: 42, analyzed: 34 },
  { day: "Tue", calls: 51, analyzed: 44 },
  { day: "Wed", calls: 38, analyzed: 30 },
  { day: "Thu", calls: 63, analyzed: 55 },
  { day: "Fri", calls: 72, analyzed: 61 },
  { day: "Sat", calls: 34, analyzed: 27 },
  { day: "Sun", calls: 21, analyzed: 16 },
];

export const resolutionSeries: { name: Resolution; value: number }[] = [
  { name: "Resolved", value: 186 },
  { name: "Unresolved", value: 41 },
  { name: "Follow-up Required", value: 67 },
];

export const monthlyVolume = [
  { month: "Apr", calls: 620, analyzed: 480 },
  { month: "May", calls: 710, analyzed: 566 },
  { month: "Jun", calls: 690, analyzed: 590 },
  { month: "Jul", calls: 820, analyzed: 705 },
  { month: "Aug", calls: 905, analyzed: 812 },
  { month: "Sep", calls: 964, analyzed: 878 },
];

export const statusSeries = [
  { status: "Analyzed", count: 878 },
  { status: "Queued", count: 46 },
  { status: "Failed", count: 12 },
  { status: "Archived", count: 128 },
];

export const kpis = {
  totalCalls: 964,
  analyzedCalls: 878,
  resolvedCalls: 186,
  followUp: 67,
};

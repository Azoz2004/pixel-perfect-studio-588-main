export const LEVELS = [
  { id: 1, name: "السفرة", desc: "10 صفحات أسبوعياً · سنة ونصف", weekly: 10 },
  { id: 2, name: "الكرام", desc: "5 صفحات أسبوعياً · 3 سنين", weekly: 5 },
  { id: 3, name: "البررة", desc: "3 صفحات أسبوعياً · 5 سنين", weekly: 3 },
  { id: 4, name: "الدؤوبين", desc: "صفحتان أسبوعياً · 7 سنين", weekly: 2 },
  { id: 5, name: "الأوابين", desc: "آية كل يوم", weekly: 0 },
] as const;

export const OVERALL_RATINGS = ["امتياز", "جيد جداً", "جيد", "متوسط", "ضعيف"] as const;

export const levelName = (l: number) => LEVELS.find((x) => x.id === l)?.name ?? "";

export function sessionRating(m: number) {
  if (m <= 1) return "امتياز";
  if (m === 2) return "ممتاز";
  if (m === 3) return "جيد جداً";
  if (m === 4) return "جيد";
  return "يحتاج إعادة";
}

export function ratingTone(r: string) {
  if (r === "امتياز" || r === "ممتاز") return "bg-success/15 text-success";
  if (r === "جيد جداً" || r === "جيد") return "bg-warning/20 text-accent-foreground";
  return "bg-destructive/15 text-destructive";
}

export const phoneToEmail = (phone: string) =>
  `${phone.replace(/[^\d]/g, "")}@safwa.app`;

export const fmtDate = (d: string) =>
  new Date(d).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" });

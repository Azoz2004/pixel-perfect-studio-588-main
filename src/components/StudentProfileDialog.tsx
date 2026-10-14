import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  MessageCircle,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { fmtDate, levelName, LEVELS, ratingTone } from "@/lib/constants";
import type { Student } from "@/components/StudentDialog";

export function StudentProfileDialog({
  student,
  open,
  onOpenChange,
  supervisors,
  onStartRecite,
}: {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supervisors?: { id: string; full_name: string }[] | undefined;
  onStartRecite?: (studentId: string) => void;
}) {
  const qc = useQueryClient();
  const [sessionFilter, setSessionFilter] = useState<"all" | "hifz" | "review">("all");
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const { data: recs, isLoading } = useQuery({
    queryKey: ["student-recitations-profile", student?.id],
    enabled: !!student?.id && open,
    queryFn: async () => {
      const { data } = await supabase
        .from("recitations")
        .select("*")
        .eq("student_id", student!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const levelInfo = LEVELS.find((l) => l.id === student?.level);
  const supervisorName = supervisors?.find((s) => s.id === student?.supervisor_id)?.full_name;

  // الإحصائيات الشاملة
  const stats = useMemo(() => {
    if (!recs || !student) {
      return {
        hifzPages: 0,
        reviewPages: 0,
        totalHifz: 0,
        completionPct: 0,
        remainingPages: 604,
        totalSessions: 0,
        hifzSessions: 0,
        reviewSessions: 0,
        totalMistakes: 0,
        avgMistakes: "0",
        excellentCount: 0,
        lastRec: undefined,
        daysLate: null,
      };
    }

    const hPages = recs
      .filter((r) => r.kind === "hifz")
      .reduce((acc, r) => acc + (r.pages ?? (r.to_page - r.from_page + 1)), 0);

    const rPages = recs
      .filter((r) => r.kind === "review")
      .reduce((acc, r) => acc + (r.pages ?? (r.to_page - r.from_page + 1)), 0);

    const totalH = hPages + (student.prior_pages || 0);
    const pct = Math.min(100, Math.round((totalH / 604) * 100));
    const remaining = Math.max(0, 604 - totalH);

    const totalMis = recs.reduce((acc, r) => acc + (r.mistakes || 0), 0);
    const avgMis = recs.length > 0 ? (totalMis / recs.length).toFixed(1) : "0";

    const excCount = recs.filter((r) => r.rating === "امتياز" || r.rating === "ممتاز").length;

    const last = recs[0];
    let late: number | null = null;
    if (last) {
      late = Math.max(0, Math.floor((Date.now() - new Date(last.created_at).getTime()) / (1000 * 60 * 60 * 24)));
    }

    return {
      hifzPages: hPages,
      reviewPages: rPages,
      totalHifz: totalH,
      completionPct: pct,
      remainingPages: remaining,
      totalSessions: recs.length,
      hifzSessions: recs.filter((r) => r.kind === "hifz").length,
      reviewSessions: recs.filter((r) => r.kind === "review").length,
      totalMistakes: totalMis,
      avgMistakes: avgMis,
      excellentCount: excCount,
      lastRec: last,
      daysLate: late,
    };
  }, [recs, student]);

  const filteredRecs = useMemo(() => {
    if (!recs) return [];
    if (sessionFilter === "all") return recs;
    return recs.filter((r) => r.kind === sessionFilter);
  }, [recs, sessionFilter]);

  async function confirmDeleteSession() {
    if (!toDeleteId) return;
    const { error } = await supabase.from("recitations").delete().eq("id", toDeleteId);
    setToDeleteId(null);
    if (error) {
      toast.error("تعذر حذف الجلسة");
      return;
    }
    toast.success("تم حذف الجلسة");
    qc.invalidateQueries({ queryKey: ["student-recitations-profile", student?.id] });
    qc.invalidateQueries({ queryKey: ["recitations"] });
    qc.invalidateQueries({ queryKey: ["recitations-for-alerts"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
    qc.invalidateQueries({ queryKey: ["honor"] });
  }

  function openWhatsApp() {
    if (!student?.phone) {
      toast.error("لا يوجد رقم هاتف مسجل للطالب");
      return;
    }
    let clean = student.phone.replace(/[^\d]/g, "");
    if (clean.startsWith("05") && clean.length === 10) {
      clean = "966" + clean.slice(1);
    }
    const text = `السلام عليكم ورحمة الله وبركاته أخي ${student.full_name}، تحية طيبة من حلقة القرآن (صفوة الإخاء) 🌸`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, "_blank");
  }

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[92vh] max-w-2xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold">ملف الطالب التفصيلي</DialogTitle>
        </DialogHeader>

        {/* بطاقة التعريف العلوية */}
        <div className="rounded-2xl border bg-card p-4 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-extrabold text-primary">
                {student.full_name.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{student.full_name}</h3>
                  {student.user_id && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      حساب مفعّل
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  مستوى <span className="font-semibold text-foreground">{levelName(student.level)}</span> · {levelInfo?.desc}
                </p>
                {supervisorName && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    المسمّع المشرف: <span className="font-medium text-foreground">{supervisorName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* أزرار الاتصال والمراسلة */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              {student.phone && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 gap-1.5 text-xs font-semibold"
                    onClick={() => window.open(`tel:${student.phone}`)}
                  >
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    اتصال
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold"
                    onClick={openWhatsApp}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    واتساب
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* حالة الالتزام الحالية */}
          <div className="mt-3 border-t pt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">حالة الالتزام بالتسميع:</span>
            {stats.daysLate === null ? (
              <span className="font-bold text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                لم يبدأ التسميع بعد
              </span>
            ) : stats.daysLate > 14 ? (
              <span className="font-bold text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                منقطع منذ {stats.daysLate} يوم (&gt; أسبوعين)
              </span>
            ) : stats.daysLate > 8 ? (
              <span className="font-bold text-amber-600 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                متأخر منذ {stats.daysLate} أيام (&gt; 8 أيام)
              </span>
            ) : (
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                منتظم (آخر تسميع {stats.daysLate === 0 ? "اليوم" : `منذ ${stats.daysLate} يوم`})
              </span>
            )}
          </div>
        </div>

        {/* مسار ختم المصحف الشريف (604 صفحات) */}
        <div className="rounded-2xl border bg-card p-4 shadow-soft space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" />
              مسار ختم المصحف الشريف
            </span>
            <span className="text-primary font-extrabold text-sm">{stats.completionPct}%</span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${stats.completionPct}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
            <span>
              إجمالي المحفوظ: <strong className="text-foreground">{stats.totalHifz}</strong> من 604 صفحة
            </span>
            <span>
              المتبقي للختم: <strong className="text-primary">{stats.remainingPages}</strong> صفحة
            </span>
          </div>

          <div className="flex gap-2 text-[11px] pt-1">
            <span className="rounded-lg bg-muted px-2.5 py-1">
              صفحات سابقة: <strong>{student.prior_pages || 0}</strong>
            </span>
            <span className="rounded-lg bg-muted px-2.5 py-1">
              حفظ داخل الدورة: <strong>{stats.hifzPages}</strong>
            </span>
            <span className="rounded-lg bg-muted px-2.5 py-1">
              التقييم العام: <strong>{student.overall_rating}</strong>
            </span>
          </div>
        </div>

        {/* المؤشرات والإحصائيات السريعة */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-2xl border bg-card p-3 text-center shadow-soft">
            <div className="text-xl font-extrabold text-primary">{stats.totalSessions}</div>
            <div className="mt-1 text-[11px] text-muted-foreground font-semibold">إجمالي الجلسات</div>
          </div>
          <div className="rounded-2xl border bg-card p-3 text-center shadow-soft">
            <div className="text-xl font-extrabold text-emerald-600">{stats.hifzPages}</div>
            <div className="mt-1 text-[11px] text-muted-foreground font-semibold">صفحات الحفظ</div>
          </div>
          <div className="rounded-2xl border bg-card p-3 text-center shadow-soft">
            <div className="text-xl font-extrabold text-amber-600">{stats.reviewPages}</div>
            <div className="mt-1 text-[11px] text-muted-foreground font-semibold">صفحات المراجعة</div>
          </div>
          <div className="rounded-2xl border bg-card p-3 text-center shadow-soft">
            <div className="text-xl font-extrabold text-foreground">{stats.avgMistakes}</div>
            <div className="mt-1 text-[11px] text-muted-foreground font-semibold">معدل الأخطاء/جلسة</div>
          </div>
        </div>

        {/* زر التسميع الفوري */}
        {onStartRecite && (
          <Button
            size="lg"
            className="w-full gap-2 text-sm font-bold shadow-soft"
            onClick={() => {
              onStartRecite(student.id);
              onOpenChange(false);
            }}
          >
            <BookOpen className="h-4 w-4" />
            بدء تسجيل تسميع لهذا الطالب الآن
          </Button>
        )}

        {/* سجل جلسات الطالب */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span>سجل جلسات الطالب ({recs?.length || 0})</span>
            </div>

            {/* فلتر نوع الجلسة */}
            <div className="flex gap-1 text-xs">
              {(["all", "hifz", "review"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSessionFilter(mode)}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                    sessionFilter === mode
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {mode === "all" ? "الكل" : mode === "hifz" ? "حفظ" : "مراجعة"}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">جارٍ تحميل الجلسات…</div>
          ) : filteredRecs.length === 0 ? (
            <div className="rounded-xl border border-dashed py-8 text-center text-xs text-muted-foreground">
              لا توجد جلسات مسجلة تطابق التصفية
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredRecs.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border bg-card p-3 shadow-soft flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          r.kind === "hifz" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
                        }`}
                      >
                        {r.kind === "hifz" ? "حفظ" : "مراجعة"}
                      </span>
                      <span className="font-bold text-sm">
                        ص {r.from_page} – {r.to_page} ({r.pages ?? r.to_page - r.from_page + 1} ص)
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{r.mistakes} أخطاء</span>
                      <span>·</span>
                      <span>{fmtDate(r.created_at)}</span>
                    </div>
                    {r.notes && (
                      <p className="mt-1 text-xs text-foreground bg-muted/50 rounded-lg p-1.5">{r.notes}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ratingTone(r.rating ?? "")}`}>
                      {r.rating}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => setToDeleteId(r.id)}
                      aria-label="حذف الجلسة"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ConfirmDialog
          open={!!toDeleteId}
          title="حذف جلسة التسميع"
          description="هل أنت متأكد من حذف هذه الجلسة؟ سيتم خصم صفحاتها من إحصائيات الطالب."
          confirmLabel="حذف"
          destructive
          onConfirm={confirmDeleteSession}
          onCancel={() => setToDeleteId(null)}
        />
      </DialogContent>
    </Dialog>
  );
}

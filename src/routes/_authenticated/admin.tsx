import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BarChart3, Filter, PieChart as PieChartIcon, Trash2, UserPlus } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, CardSkeleton, Panel, Stat } from "@/components/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchMe, useMe } from "@/lib/session";
import { LEVELS } from "@/lib/constants";
import { createStaff, deleteAccount } from "@/lib/accounts.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const me = await fetchMe();
    if (me?.role !== "super_admin") throw redirect({ to: "/halaqa" });
  },
  head: () => ({ meta: [{ title: "لوحة التحكم — صفوة الإخاء" }, { name: "description", content: "إحصائيات الدورة وإدارة المشرفين والمسمّعين." }] }),
  component: Admin,
});

function Admin() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [dlg, setDlg] = useState<null | "supervisor" | "super_admin">(null);
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>("all");

  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [{ data: st }, { data: recs }] = await Promise.all([
        supabase.from("students").select("id,level,supervisor_id,prior_pages"),
        supabase.from("recitations").select("pages,kind,rating,supervisor_id,created_at"),
      ]);
      return { students: st ?? [], recs: recs ?? [] };
    },
  });

  const staff = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id,role").in("role", ["super_admin", "supervisor"]);
      const ids = [...new Set((roles ?? []).map((r) => r.user_id))];
      const { data: profs } = ids.length ? await supabase.from("profiles").select("id,full_name,phone").in("id", ids) : { data: [] };
      return (profs ?? []).map((p) => ({ ...p, role: roles!.find((r) => r.user_id === p.id)!.role }));
    },
  });

  const s = stats.data;

  // الفلترة حسب المسمّع المختار
  const filteredStudents = useMemo(() => {
    if (!s?.students) return [];
    if (selectedSupervisor === "all") return s.students;
    return s.students.filter((st) => st.supervisor_id === selectedSupervisor);
  }, [s?.students, selectedSupervisor]);

  const filteredRecs = useMemo(() => {
    if (!s?.recs) return [];
    if (selectedSupervisor === "all") return s.recs;
    return s.recs.filter((r) => r.supervisor_id === selectedSupervisor);
  }, [s?.recs, selectedSupervisor]);

  const pages = useMemo(
    () => filteredRecs.filter((r) => r.kind === "hifz").reduce((a, r) => a + (r.pages ?? 0), 0),
    [filteredRecs]
  );
  const week = useMemo(
    () => filteredRecs.filter((r) => Date.now() - +new Date(r.created_at) < 7 * 864e5).length,
    [filteredRecs]
  );
  const excellent = useMemo(
    () => filteredRecs.filter((r) => r.rating === "امتياز" || r.rating === "ممتاز").length,
    [filteredRecs]
  );

  // بيانات الرسم البياني الشريطي لآخر 14 يوماً
  const dailyPagesData = useMemo(() => {
    const days: { dateKey: string; label: string; hifz: number; review: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("ar-SA", { day: "numeric", month: "numeric" });
      days.push({ dateKey, label, hifz: 0, review: 0 });
    }

    filteredRecs.forEach((r) => {
      const rDateKey = new Date(r.created_at).toISOString().slice(0, 10);
      const dayObj = days.find((d) => d.dateKey === rDateKey);
      if (dayObj) {
        const p = r.pages ?? 0;
        if (r.kind === "hifz") {
          dayObj.hifz += p;
        } else {
          dayObj.review += p;
        }
      }
    });

    return days;
  }, [filteredRecs]);

  // بيانات الرسم البياني الدائري لتوزيع التقييمات
  const { ratingsData, totalRatings } = useMemo(() => {
    const counts: Record<string, number> = {
      "امتياز": 0,
      "ممتاز": 0,
      "جيد جداً": 0,
      "جيد": 0,
      "يحتاج إعادة": 0,
    };

    filteredRecs.forEach((r) => {
      if (r.rating && r.rating in counts) {
        counts[r.rating] = (counts[r.rating] ?? 0) + 1;
      }
    });

    const colorMap: Record<string, string> = {
      "امتياز": "#10b981",
      "ممتاز": "#06b6d4",
      "جيد جداً": "#3b82f6",
      "جيد": "#f59e0b",
      "يحتاج إعادة": "#f43f5e",
    };

    const data = Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: colorMap[name] || "#64748b",
      }));

    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    return { ratingsData: data, totalRatings: total };
  }, [filteredRecs]);

  if (stats.isLoading) {
    return (
      <AppShell title="لوحة التحكم">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-4 text-center shadow-soft">
              <div className="h-8 w-16 rounded-full bg-muted mx-auto mb-2" />
              <div className="h-3 w-20 rounded-full bg-muted/70 mx-auto" />
            </div>
          ))}
        </div>
        <CardSkeleton rows={3} />
      </AppShell>
    );
  }

  async function remove(id: string, name: string) {
    setToDelete({ id, name });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteAccount({ data: { userId: toDelete.id } });
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["staff"] });
    } catch (e) { toast.error((e as Error).message); } finally { setDeleting(false); setToDelete(null); }
  }

function RecitationsChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const hifz = payload.find((p: any) => p.dataKey === "hifz")?.value ?? 0;
  const review = payload.find((p: any) => p.dataKey === "review")?.value ?? 0;
  const total = hifz + review;

  return (
    <div className="rounded-2xl border border-border/80 bg-card/95 p-3 shadow-xl backdrop-blur-md text-xs min-w-36 text-right" dir="rtl">
      <div className="font-bold text-foreground mb-1.5 pb-1 border-b border-border/50 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[11px] font-extrabold text-primary">{total} صفحة</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
            حفظ جديد:
          </span>
          <span className="font-bold">{hifz} صفحة</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-amber-600 dark:text-amber-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 shadow-sm" />
            مراجعة:
          </span>
          <span className="font-bold">{review} صفحة</span>
        </div>
      </div>
    </div>
  );
}

  return (
    <AppShell title="لوحة التحكم">
      {/* شريط فلترة الإحصائيات حسب المسمّع */}
      <Panel className="mb-3 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">فلترة حسب المسمّع:</span>
          </div>
          <div className="w-full sm:w-80">
            <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
              <SelectTrigger className="h-11 rounded-xl bg-card border-input font-bold text-xs shadow-xs focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="اختر المسمّع المشرف…" />
              </SelectTrigger>
              <SelectContent dir="rtl" className="rounded-xl border shadow-xl max-h-72">
                <SelectItem value="all" className="font-bold text-xs py-2.5">
                  🌟 جميع المشرفين والمسمّعين (الدورة كاملة)
                </SelectItem>
                {/* المشرفون العامون — فوق وأوضح */}
                {staff.data?.filter((s) => s.role === "super_admin").length ? (
                  <>
                    <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-primary/70 tracking-wider uppercase select-none">
                      👑 المشرفون العامون
                    </div>
                    {staff.data?.filter((s) => s.role === "super_admin").map((sup) => (
                      <SelectItem
                        key={sup.id}
                        value={sup.id}
                        className="text-sm font-extrabold py-2.5 text-foreground"
                      >
                        👑 {sup.full_name}
                      </SelectItem>
                    ))}
                  </>
                ) : null}
                {/* المسمّعون العاديون — تحت وبخط أخف */}
                {staff.data?.filter((s) => s.role === "supervisor").length ? (
                  <>
                    <div className="px-2 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase select-none border-t mt-1">
                      👤 المسمّعون
                    </div>
                    {staff.data?.filter((s) => s.role === "supervisor").map((sup) => (
                      <SelectItem
                        key={sup.id}
                        value={sup.id}
                        className="text-xs font-semibold py-2 text-muted-foreground"
                      >
                        👤 {sup.full_name}
                      </SelectItem>
                    ))}
                  </>
                ) : null}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Panel>

      {/* بطاقات المؤشرات الأساسية */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="الطلاب" value={filteredStudents.length} />
        <Stat label="صفحات حفظ مسجلة" value={pages} />
        <Stat label="جلسات هذا الأسبوع" value={week} />
        <Stat label="جلسات متميزة" value={excellent} />
      </div>

      {/* قسم الرسوم البيانية التفاعلية العصرية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        {/* رسم بياني انسيابي متطور لصفحات التسميع اليومية */}
        <Panel className="relative overflow-hidden">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm">الصفحات المسمّعة (آخر 14 يوماً)</h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" /> حفظ
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm" /> مراجعة
              </span>
            </div>
          </div>
          <div className="h-64 w-full pt-1" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyPagesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hifzGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="reviewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.12} stroke="currentColor" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.65 }}
                  tickLine={false}
                  axisLine={{ stroke: "currentColor", opacity: 0.15 }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.65 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<RecitationsChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="hifz"
                  name="hifz"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#hifzGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="review"
                  name="review"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#reviewGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* رسم بياني دائري عصري لنسب تقييمات الجلسات */}
        <Panel className="relative">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm">نسب تقييمات الجلسات</h3>
            </div>
            {totalRatings > 0 && (
              <span className="text-xs text-muted-foreground font-semibold">
                {totalRatings} جلسة
              </span>
            )}
          </div>
          {ratingsData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
              لا توجد جلسات تسميع مسجلة بعد
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              <div className="relative h-56 w-56 shrink-0" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ratingsData}
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={4}
                      cornerRadius={6}
                      dataKey="value"
                    >
                      {ratingsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="hsl(var(--card))"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (!active || !payload || !payload.length) return null;
                        const first = payload[0];
                        if (!first) return null;
                        const item = first.payload;
                        if (!item) return null;
                        const pct = totalRatings ? Math.round((item.value / totalRatings) * 100) : 0;
                        return (
                          <div className="rounded-xl border border-border/80 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-md text-xs text-right" dir="rtl">
                            <div className="font-bold flex items-center gap-1.5" style={{ color: item.color }}>
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </div>
                            <div className="text-muted-foreground mt-0.5">
                              {item.value} جلسة ({pct}%)
                            </div>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* عداد مركزي جذاب داخل تجويف الدونات */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black tracking-tight text-foreground">{totalRatings}</span>
                  <span className="text-[11px] font-semibold text-muted-foreground">جلسة تسميع</span>
                </div>
              </div>

              {/* تفصيل توزيع التقييمات */}
              <div className="flex flex-col gap-2 w-full max-w-xs text-xs">
                {ratingsData.map((item) => {
                  const pct = totalRatings ? Math.round((item.value / totalRatings) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between rounded-xl bg-muted/40 p-2 border border-border/40">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                        <span className="font-bold">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{item.value}</span>
                        <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs" style={{ backgroundColor: item.color }}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* توزيع المستويات */}
      <Panel className="mt-3">
        <h2 className="mb-3 font-bold">توزيع المستويات للطلاب</h2>
        {LEVELS.map((l) => {
          const n = filteredStudents.filter((x) => x.level === l.id).length;
          const pct = filteredStudents.length ? (n / filteredStudents.length) * 100 : 0;
          return (
            <div key={l.id} className="mb-2">
              <div className="flex justify-between text-sm"><span>{l.name}</span><span className="text-muted-foreground">{n}</span></div>
              <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </Panel>

      {/* إدارة المشرفين والمسمّعين */}
      <Panel className="mt-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">المشرفون والمسمّعون</h2>
          <div className="flex gap-1">
            <Button size="sm" onClick={() => setDlg("supervisor")}><UserPlus />مسمّع</Button>
            <Button size="sm" variant="secondary" onClick={() => setDlg("super_admin")}>مشرف عام</Button>
          </div>
        </div>
        <div className="divide-y">
          {staff.data?.map((p) => {
            const count = s?.students.filter((x) => x.supervisor_id === p.id).length ?? 0;
            return (
              <div key={p.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="font-bold">{p.full_name}</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">{p.phone}</div>
                  <div className="text-xs text-muted-foreground">{p.role === "super_admin" ? "مشرف عام" : `مسمّع · ${count} طالب`}</div>
                </div>
                {p.id !== me?.id && <Button size="icon" variant="ghost" onClick={() => remove(p.id, p.full_name)} aria-label="حذف"><Trash2 className="text-destructive" /></Button>}
              </div>
            );
          })}
        </div>
      </Panel>
      <StaffDialog role={dlg} onClose={() => setDlg(null)} />
      <ConfirmDialog
        open={!!toDelete}
        title={`حذف حساب ${toDelete?.name ?? ""}`}
        description="سيُحذف هذا الحساب نهائياً ولن يتمكن صاحبه من الدخول. هذا الإجراء لا يمكن التراجع عنه."
        confirmLabel={deleting ? "جارٍ الحذف…" : "حذف"}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </AppShell>
  );
}

function StaffDialog({ role, onClose }: { role: null | "supervisor" | "super_admin"; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  async function go() {
    if (!role) return;
    setBusy(true);
    try {
      await createStaff({ data: { ...f, role } });
      toast.success("تم إنشاء الحساب");
      qc.invalidateQueries({ queryKey: ["staff"] }); qc.invalidateQueries({ queryKey: ["supervisors"] });
      setF({ name: "", phone: "", password: "" }); onClose();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <Dialog open={!!role} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>{role === "super_admin" ? "إضافة مشرف عام" : "إضافة مسمّع"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>الاسم</Label><Input className="h-11" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><Label>رقم الهاتف</Label><Input dir="ltr" className="h-11 text-right" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div><Label>كلمة المرور</Label><Input className="h-11" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          <Button className="w-full" size="lg" onClick={go} disabled={busy}>إنشاء</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

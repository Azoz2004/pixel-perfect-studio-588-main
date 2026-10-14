import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, CardSkeleton, Panel, Stat } from "@/components/AppShell";
import { fmtDate, LEVELS, ratingTone } from "@/lib/constants";
import { useMe } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/me")({
  ssr: false,
  head: () => ({ meta: [{ title: "صفحتي — صفوة الإخاء" }, { name: "description", content: "تقدمك في الحفظ وسجل جلساتك وتقييماتك." }] }),
  component: Me,
});

function Me() {
  const { data: me } = useMe();
  const { data, isLoading } = useQuery({
    queryKey: ["my-progress", me?.id], enabled: !!me,
    queryFn: async () => {
      const { data: st } = await supabase.from("students").select("*").eq("user_id", me!.id).maybeSingle();
      if (!st) return null;
      const { data: recs } = await supabase.from("recitations").select("*").eq("student_id", st.id).order("created_at", { ascending: false });
      return { st, recs: recs ?? [] };
    },
  });
  const recs = data?.recs ?? [];
  const hifz = recs.filter((r) => r.kind === "hifz").reduce((a, r) => a + (r.pages ?? 0), 0);
  const total = hifz + (data?.st.prior_pages ?? 0);
  const level = LEVELS.find((l) => l.id === data?.st.level);
  const pct = Math.min(100, Math.round((total / 604) * 100));

  if (isLoading) {
    return (
      <AppShell title="صفحتي">
        <div className="grid grid-cols-3 gap-2 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-4 text-center shadow-soft">
              <div className="h-8 w-12 rounded-full bg-muted mx-auto mb-2" />
              <div className="h-3 w-16 rounded-full bg-muted/70 mx-auto" />
            </div>
          ))}
        </div>
        <CardSkeleton rows={4} />
      </AppShell>
    );
  }

  return (
    <AppShell title="صفحتي">
      {!data ? (
        <Panel className="text-center text-muted-foreground">لم يُربط حسابك بملف طالب بعد</Panel>
      ) : (
        <div className="space-y-3">
          <Panel>
            <div className="flex items-center justify-between text-sm">
              <span>مستوى {level?.name}</span><span className="text-muted-foreground">{level?.desc}</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
            <p className="mt-2 text-center text-sm text-muted-foreground">{total} من 604 صفحة ({pct}%)</p>
          </Panel>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="صفحات محفوظة" value={total} />
            <Stat label="جلسات" value={recs.length} />
            <Stat label="التقييم العام" value={<span className="text-lg">{data.st.overall_rating}</span>} />
          </div>
          <h2 className="pt-2 font-bold">سجل الجلسات</h2>
          {recs.length === 0 && <Panel className="text-center text-muted-foreground">لا توجد جلسات بعد</Panel>}
          {recs.map((r) => (
            <Panel key={r.id} className="flex items-center justify-between">
              <div>
                <div className="font-bold">{r.kind === "hifz" ? "حفظ" : "مراجعة"} · ص {r.from_page}–{r.to_page}</div>
                <div className="text-xs text-muted-foreground">{r.mistakes} أخطاء · {fmtDate(r.created_at)}</div>
                {r.notes && <div className="mt-1 text-xs">{r.notes}</div>}
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ratingTone(r.rating ?? "")}`}>{r.rating}</span>
            </Panel>
          ))}
        </div>
      )}
    </AppShell>
  );
}

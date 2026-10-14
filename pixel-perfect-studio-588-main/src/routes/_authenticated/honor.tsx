import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Panel } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/honor")({
  ssr: false,
  head: () => ({ meta: [{ title: "لوحة الشرف — صفوة الإخاء" }, { name: "description", content: "المتميزون في الحفظ خلال آخر 30 يوماً." }] }),
  component: Honor,
});

function Honor() {
  const { data } = useQuery({ queryKey: ["honor"], queryFn: async () => (await supabase.rpc("honor_board")).data ?? [] });
  return (
    <AppShell title="لوحة الشرف">
      <p className="mb-3 rounded-xl bg-card p-3 text-center text-sm text-muted-foreground shadow-soft">المتميزون خلال آخر 30 يوماً</p>
      <div className="space-y-2">
        {!data?.length && <Panel className="text-center text-muted-foreground">لا يوجد متميزون بعد</Panel>}
        {data?.map((s, i) => (
          <Panel key={i} className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full font-extrabold ${i < 3 ? "bg-accent text-accent-foreground" : "bg-muted"}`}>
              {i < 3 ? <Trophy className="h-5 w-5" /> : i + 1}
            </div>
            <div className="flex-1">
              <div className="font-bold">{s.full_name}</div>
              <div className="text-xs text-muted-foreground">{s.excellent} جلسة متميزة · {s.total_pages} صفحة حفظ</div>
            </div>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}

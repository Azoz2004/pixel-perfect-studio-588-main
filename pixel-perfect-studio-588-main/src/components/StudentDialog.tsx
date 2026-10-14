import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LEVELS, OVERALL_RATINGS } from "@/lib/constants";
import { useMe } from "@/lib/session";

export type Student = {
  id: string; full_name: string; phone: string; level: number; prior_pages: number;
  overall_rating: string; supervisor_id: string; user_id: string | null;
};

export function StudentDialog({ open, onOpenChange, student, supervisors, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; student?: Student | null | undefined;
  supervisors?: { id: string; full_name: string }[] | undefined; onSaved?: (id: string) => void;
}) {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [f, setF] = useState({ full_name: "", phone: "", level: 1, prior_pages: 0, overall_rating: "جيد", supervisor_id: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setF(student ? { ...student } : { full_name: "", phone: "", level: 1, prior_pages: 0, overall_rating: "جيد", supervisor_id: me?.role === "supervisor" ? me.id : supervisors?.[0]?.id ?? "" });
  }, [open, student, me, supervisors]);

  async function save() {
    if (!f.full_name.trim()) { toast.error("اسم الطالب مطلوب"); return; }
    if (!f.supervisor_id) { toast.error("اختر المسمّع"); return; }
    setBusy(true);
    const payload = { full_name: f.full_name.trim(), phone: f.phone, level: f.level, prior_pages: f.prior_pages, overall_rating: f.overall_rating, supervisor_id: f.supervisor_id };
    const res = student
      ? await supabase.from("students").update(payload).eq("id", student.id).select("id").single()
      : await supabase.from("students").insert(payload).select("id").single();
    setBusy(false);
    if (res.error) { toast.error("تعذر الحفظ"); return; }
    toast.success("تم الحفظ");
    qc.invalidateQueries({ queryKey: ["students"] });
    onSaved?.(res.data.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{student ? "تعديل بيانات الطالب" : "طالب جديد"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>الاسم</Label><Input className="h-11" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></div>
          <div><Label>رقم الهاتف</Label><Input dir="ltr" className="h-11 text-right" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          {me?.role === "super_admin" && supervisors && (
            <div><Label>المسمّع</Label>
              <select className="h-11 w-full rounded-md border bg-background px-3" value={f.supervisor_id} onChange={(e) => setF({ ...f, supervisor_id: e.target.value })}>
                <option value="">— اختر —</option>
                {supervisors.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
          )}
          <div>
            <Label>المستوى</Label>
            <div className="mt-1 grid gap-2">
              {LEVELS.map((l) => (
                <button type="button" key={l.id} onClick={() => setF({ ...f, level: l.id })}
                  className={`rounded-xl border p-2.5 text-right ${f.level === l.id ? "border-primary bg-primary/10" : ""}`}>
                  <div className="font-bold">مستوى {l.name}</div><div className="text-xs text-muted-foreground">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div><Label>الحفظ المسبق (عدد الصفحات)</Label><Input type="number" inputMode="numeric" className="h-11" value={f.prior_pages} onChange={(e) => setF({ ...f, prior_pages: +e.target.value || 0 })} /></div>
          <div>
            <Label>التقييم العام</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {OVERALL_RATINGS.map((r) => (
                <button type="button" key={r} onClick={() => setF({ ...f, overall_rating: r })}
                  className={`rounded-full border px-3 py-1.5 text-sm ${f.overall_rating === r ? "border-primary bg-primary text-primary-foreground" : ""}`}>{r}</button>
              ))}
            </div>
          </div>
          <Button size="lg" className="w-full" onClick={save} disabled={busy}>حفظ</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

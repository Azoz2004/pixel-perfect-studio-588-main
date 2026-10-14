import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LEVELS, OVERALL_RATINGS } from "@/lib/constants";
import { useMe } from "@/lib/session";

export type Student = {
  id: string; full_name: string; phone: string; level: number; prior_pages: number;
  overall_rating: string; supervisor_id: string; user_id: string | null;
};

export type SupervisorItem = { id: string; full_name: string; phone?: string; role?: string };

export function StudentDialog({ open, onOpenChange, student, supervisors, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; student?: Student | null | undefined;
  supervisors?: SupervisorItem[] | undefined; onSaved?: (id: string) => void;
}) {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [f, setF] = useState({ full_name: "", phone: "", level: 1, prior_pages: 0, overall_rating: "امتياز", supervisor_id: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      if (student) {
        setF({
          full_name: student.full_name,
          phone: student.phone,
          level: student.level,
          prior_pages: student.prior_pages,
          overall_rating: student.overall_rating || "امتياز",
          supervisor_id: student.supervisor_id || (me?.id ?? supervisors?.[0]?.id ?? ""),
        });
      } else {
        // عند إضافة طالب جديد: الافتراضي دائماً هو المسمع/المشرف الحالي (me.id) والتقييم امتياز تلقائياً
        setF({
          full_name: "",
          phone: "",
          level: 1,
          prior_pages: 0,
          overall_rating: "امتياز",
          supervisor_id: me?.id || (supervisors?.[0]?.id ?? ""),
        });
      }
    }
  }, [open, student, me, supervisors]);

  async function save() {
    if (!f.full_name.trim()) { toast.error("اسم الطالب مطلوب"); return; }
    if (!f.supervisor_id) { toast.error("اختر المسمّع"); return; }
    setBusy(true);
    const payload = {
      full_name: f.full_name.trim(),
      phone: f.phone,
      level: f.level,
      prior_pages: f.prior_pages,
      overall_rating: student ? f.overall_rating : "امتياز", // تلقائياً امتياز عند الإضافة
      supervisor_id: f.supervisor_id,
    };
    const res = student
      ? await supabase.from("students").update(payload).eq("id", student.id).select("id").single()
      : await supabase.from("students").insert(payload).select("id").single();
    setBusy(false);
    if (res.error) { toast.error("تعذر الحفظ"); return; }
    toast.success(student ? "تم تعديل بيانات الطالب بنجاح" : "تمت إضافة الطالب بنجاح (التقييم: امتياز)");
    qc.invalidateQueries({ queryKey: ["students"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
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
          {me?.role === "super_admin" && supervisors && supervisors.length > 0 && (
            <div>
              <Label className="font-semibold text-xs mb-1 block">المسمّع المشرف على الطالب</Label>
              <Select value={f.supervisor_id} onValueChange={(val) => setF({ ...f, supervisor_id: val })}>
                <SelectTrigger className="mt-1 h-12 w-full rounded-xl bg-background text-sm font-bold shadow-xs">
                  <SelectValue placeholder="— اختر المسمّع المشرف —" />
                </SelectTrigger>
                <SelectContent dir="rtl" className="rounded-xl border shadow-xl max-h-72">
                  {supervisors.map((s) => {
                    const isMe = s.id === me?.id;
                    return (
                      <SelectItem key={s.id} value={s.id} className="py-2.5 text-xs font-semibold cursor-pointer">
                        <div className="flex items-center gap-2">
                          {isMe ? (
                            <span className="flex items-center gap-1.5 font-extrabold text-primary">
                              <span>⭐ {s.full_name}</span>
                              <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/30">
                                (أنا)
                              </span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <span>{s.full_name}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">
                                ({s.role === "super_admin" ? "مشرف عام" : "مسمّع"})
                              </span>
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                بصفتك مشرفاً عاماً ومسمّعاً، الطالب مسند إليك تلقائياً ويمكنك اختياره لأي مسمّع آخر.
              </p>
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
          <Button size="lg" className="w-full mt-2" onClick={save} disabled={busy}>حفظ</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

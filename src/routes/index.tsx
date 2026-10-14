import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { phoneToEmail } from "@/lib/constants";
import { fetchMe, homeFor } from "@/lib/session";
import { bootstrapAdmin } from "@/lib/accounts.functions";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — صفوة الإخاء" },
      { name: "description", content: "ادخل برقم هاتفك لمتابعة حلقات التحفيظ والتسميع في دورة صفوة الإخاء." },
      { property: "og:title", content: "صفوة الإخاء — دورة تحفيظ القرآن" },
      { property: "og:description", content: "متابعة الحفظ والتسميع اليومي والتقييمات ولوحة الشرف." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [setup, setSetup] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await fetchMe();
      if (me?.role) return navigate({ to: homeFor(me.role), replace: true });
      const { data } = await supabase.rpc("has_any_user");
      setSetup(!data);
      setReady(true);
    })();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (setup) await bootstrapAdmin({ data: { name, phone, password } });
      const { error } = await supabase.auth.signInWithPassword({ email: phoneToEmail(phone), password });
      if (error) throw new Error("رقم الهاتف أو كلمة المرور غير صحيحة");
      const me = await fetchMe();
      navigate({ to: homeFor(me?.role ?? null), replace: true });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-hero text-primary-foreground">
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-12 pb-8 text-center">
        <img src="/icon-512.png" alt="" className="mb-5 h-20 w-20 rounded-3xl shadow-soft" />
        <h1 className="font-display text-5xl font-bold">صفوة الإخاء</h1>
        <p className="mt-2 opacity-85">دورة تحفيظ القرآن الكريم</p>
        <p className="mt-6 font-display text-lg opacity-75">﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾</p>
      </div>
      <form onSubmit={submit} className="rounded-t-[2rem] bg-background px-6 pt-8 pb-10 text-foreground">
        <div className="mx-auto max-w-sm space-y-4">
          <h2 className="text-xl font-bold">{setup ? "إعداد حساب المشرف العام" : "تسجيل الدخول"}</h2>
          {setup && (
            <div className="space-y-1.5">
              <Label>الاسم الكامل</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-12" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>رقم الهاتف</Label>
            <Input dir="ltr" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-12 text-right" placeholder="07XXXXXXXX" />
          </div>
          <div className="space-y-1.5">
            <Label>كلمة المرور</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={busy || !ready}>
            {busy ? "جارٍ الدخول…" : setup ? "إنشاء والدخول" : "دخول"}
          </Button>
          {!setup && <p className="text-center text-sm text-muted-foreground">يحصل كل مسمّع وطالب على حسابه من المشرف</p>}
        </div>
      </form>
    </div>
  );
}

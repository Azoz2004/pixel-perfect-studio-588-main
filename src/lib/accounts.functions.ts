import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { phoneToEmail } from "./constants";

type NewAccount = { name: string; phone: string; password: string };

function validate(d: NewAccount) {
  if (!d.name?.trim()) throw new Error("الاسم مطلوب");
  if (d.phone.replace(/[^\d]/g, "").length < 7) throw new Error("رقم الهاتف غير صحيح");
  if (!d.password || d.password.length < 6) throw new Error("كلمة المرور 6 أحرف على الأقل");
}

async function createUser(d: NewAccount, role: "super_admin" | "supervisor" | "student") {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: phoneToEmail(d.phone),
    password: d.password,
    email_confirm: true,
    user_metadata: { full_name: d.name },
  });
  if (error || !data.user) throw new Error(error?.message.includes("already") ? "رقم الهاتف مسجل مسبقاً" : error?.message ?? "تعذر إنشاء الحساب");
  const id = data.user.id;
  await supabaseAdmin.from("profiles").insert({ id, full_name: d.name.trim(), phone: d.phone.trim() });
  await supabaseAdmin.from("user_roles").insert({ user_id: id, role });
  return id;
}

export const bootstrapAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: NewAccount) => d)
  .handler(async ({ data }) => {
    validate(data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true });
    if ((count ?? 0) > 0) throw new Error("تم إعداد النظام مسبقاً");
    await createUser(data, "super_admin");
    return { ok: true };
  });

export const createStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: NewAccount & { role: "super_admin" | "supervisor" }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" });
    if (!isAdmin) throw new Error("غير مصرح");
    validate(data);
    await createUser(data, data.role);
    return { ok: true };
  });

export const createStudentAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: NewAccount & { studentId: string }) => d)
  .handler(async ({ data, context }) => {
    // RLS ensures caller can only see their own students (or all if admin)
    const { data: st } = await context.supabase.from("students").select("id,user_id").eq("id", data.studentId).maybeSingle();
    if (!st) throw new Error("غير مصرح");
    if (st.user_id) throw new Error("للطالب حساب مسبقاً");
    validate(data);
    const id = await createUser(data, "student");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("students").update({ user_id: id }).eq("id", data.studentId);
    return { ok: true };
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" });
    if (!isAdmin) throw new Error("غير مصرح");
    if (data.userId === context.userId) throw new Error("لا يمكنك حذف حسابك");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.auth.admin.deleteUser(data.userId);
    return { ok: true };
  });

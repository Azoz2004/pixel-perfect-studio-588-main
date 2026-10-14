import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Role = "super_admin" | "supervisor" | "student";

export async function fetchMe() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const [{ data: roles }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", u.user.id),
    supabase.from("profiles").select("full_name,phone").eq("id", u.user.id).maybeSingle(),
  ]);
  const r = (roles ?? []).map((x) => x.role as Role);
  const role: Role | null = r.includes("super_admin") ? "super_admin" : r.includes("supervisor") ? "supervisor" : r.includes("student") ? "student" : null;
  return { id: u.user.id, role, name: profile?.full_name ?? "", phone: profile?.phone ?? "" };
}

export const homeFor = (role: Role | null) =>
  role === "student" ? "/me" : "/halaqa";

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe, staleTime: 60_000 });
}

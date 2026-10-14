import { t as supabase } from "./client-CMJpCqdw.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session-Bbxps4lU.js
async function fetchMe() {
	const { data: u } = await supabase.auth.getUser();
	if (!u.user) return null;
	const [{ data: roles }, { data: profile }] = await Promise.all([supabase.from("user_roles").select("role").eq("user_id", u.user.id), supabase.from("profiles").select("full_name,phone").eq("id", u.user.id).maybeSingle()]);
	const r = (roles ?? []).map((x) => x.role);
	const role = r.includes("super_admin") ? "super_admin" : r.includes("supervisor") ? "supervisor" : r.includes("student") ? "student" : null;
	return {
		id: u.user.id,
		role,
		name: profile?.full_name ?? "",
		phone: profile?.phone ?? ""
	};
}
var homeFor = (role) => role === "student" ? "/me" : "/halaqa";
function useMe() {
	return useQuery({
		queryKey: ["me"],
		queryFn: fetchMe,
		staleTime: 6e4
	});
}
//#endregion
export { homeFor as n, useMe as r, fetchMe as t };

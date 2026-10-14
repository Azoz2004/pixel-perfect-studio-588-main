import { a as TSS_SERVER_FUNCTION, l as createServerFn } from "./createServerFn-BhqelEmK.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-CMevzYJH.mjs";
import { a as phoneToEmail } from "./constants-D-h4F7u0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/accounts.functions-DVg2gYkK.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function validate(d) {
	if (!d.name?.trim()) throw new Error("الاسم مطلوب");
	if (d.phone.replace(/[^\d]/g, "").length < 7) throw new Error("رقم الهاتف غير صحيح");
	if (!d.password || d.password.length < 6) throw new Error("كلمة المرور 6 أحرف على الأقل");
}
async function createUser(d, role) {
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data, error } = await supabaseAdmin.auth.admin.createUser({
		email: phoneToEmail(d.phone),
		password: d.password,
		email_confirm: true,
		user_metadata: { full_name: d.name }
	});
	if (error || !data.user) throw new Error(error?.message.includes("already") ? "رقم الهاتف مسجل مسبقاً" : error?.message ?? "تعذر إنشاء الحساب");
	const id = data.user.id;
	await supabaseAdmin.from("profiles").insert({
		id,
		full_name: d.name.trim(),
		phone: d.phone.trim()
	});
	await supabaseAdmin.from("user_roles").insert({
		user_id: id,
		role
	});
	return id;
}
var bootstrapAdmin_createServerFn_handler = createServerRpc({
	id: "cae8c00623ff8792b2fd5737142e3ecc564c65bbc278c6ce17817b41bc7af529",
	name: "bootstrapAdmin",
	filename: "src/lib/accounts.functions.ts"
}, (opts) => bootstrapAdmin.__executeServer(opts));
var bootstrapAdmin = createServerFn({ method: "POST" }).inputValidator((d) => d).handler(bootstrapAdmin_createServerFn_handler, async ({ data }) => {
	validate(data);
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { count } = await supabaseAdmin.from("user_roles").select("id", {
		count: "exact",
		head: true
	});
	if ((count ?? 0) > 0) throw new Error("تم إعداد النظام مسبقاً");
	await createUser(data, "super_admin");
	return { ok: true };
});
var createStaff_createServerFn_handler = createServerRpc({
	id: "6687b5862735cdb048f8a10c652352f47ff2a8b866ef1d9240d573cbb7544b17",
	name: "createStaff",
	filename: "src/lib/accounts.functions.ts"
}, (opts) => createStaff.__executeServer(opts));
var createStaff = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createStaff_createServerFn_handler, async ({ data, context }) => {
	const { data: isAdmin } = await context.supabase.rpc("has_role", {
		_user_id: context.userId,
		_role: "super_admin"
	});
	if (!isAdmin) throw new Error("غير مصرح");
	validate(data);
	await createUser(data, data.role);
	return { ok: true };
});
var createStudentAccount_createServerFn_handler = createServerRpc({
	id: "052a947531bcb9b0ec8f56b00e7481515f12c171fa7e415dff410e4b40281f7d",
	name: "createStudentAccount",
	filename: "src/lib/accounts.functions.ts"
}, (opts) => createStudentAccount.__executeServer(opts));
var createStudentAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createStudentAccount_createServerFn_handler, async ({ data, context }) => {
	const { data: st } = await context.supabase.from("students").select("id,user_id").eq("id", data.studentId).maybeSingle();
	if (!st) throw new Error("غير مصرح");
	if (st.user_id) throw new Error("للطالب حساب مسبقاً");
	validate(data);
	const id = await createUser(data, "student");
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	await supabaseAdmin.from("students").update({ user_id: id }).eq("id", data.studentId);
	return { ok: true };
});
var deleteAccount_createServerFn_handler = createServerRpc({
	id: "e2a7326b26c24ee3e783e02f49a20bc8676dbf989282f6ae61eda9a99b17e47d",
	name: "deleteAccount",
	filename: "src/lib/accounts.functions.ts"
}, (opts) => deleteAccount.__executeServer(opts));
var deleteAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(deleteAccount_createServerFn_handler, async ({ data, context }) => {
	const { data: isAdmin } = await context.supabase.rpc("has_role", {
		_user_id: context.userId,
		_role: "super_admin"
	});
	if (!isAdmin) throw new Error("غير مصرح");
	if (data.userId === context.userId) throw new Error("لا يمكنك حذف حسابك");
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	await supabaseAdmin.auth.admin.deleteUser(data.userId);
	return { ok: true };
});
//#endregion
export { bootstrapAdmin_createServerFn_handler, createStaff_createServerFn_handler, createStudentAccount_createServerFn_handler, deleteAccount_createServerFn_handler };

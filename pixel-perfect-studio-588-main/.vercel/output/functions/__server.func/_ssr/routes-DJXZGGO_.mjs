import { r as __toESM } from "../_runtime.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as phoneToEmail } from "./constants-D-h4F7u0.mjs";
import { t as supabase } from "./client-CMJpCqdw.mjs";
import { D as require_jsx_runtime, O as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as homeFor, t as fetchMe } from "./session-Bbxps4lU.mjs";
import { i as bootstrapAdmin, n as Input, r as Label, t as Button } from "./accounts.functions-BpFPdYtl.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DJXZGGO_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const navigate = useNavigate();
	const [phone, setPhone] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [setup, setSetup] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		(async () => {
			const me = await fetchMe();
			if (me?.role) return navigate({
				to: homeFor(me.role),
				replace: true
			});
			const { data } = await supabase.rpc("has_any_user");
			setSetup(!data);
			setReady(true);
		})();
	}, [navigate]);
	async function submit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			if (setup) await bootstrapAdmin({ data: {
				name,
				phone,
				password
			} });
			const { error } = await supabase.auth.signInWithPassword({
				email: phoneToEmail(phone),
				password
			});
			if (error) throw new Error("رقم الهاتف أو كلمة المرور غير صحيحة");
			const me = await fetchMe();
			navigate({
				to: homeFor(me?.role ?? null),
				replace: true
			});
		} catch (err) {
			toast.error(err.message);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-hero text-primary-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col items-center justify-center px-6 pt-12 pb-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/icon-512.png",
					alt: "",
					className: "mb-5 h-20 w-20 rounded-3xl shadow-soft"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-5xl font-bold",
					children: "صفوة الإخاء"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 opacity-85",
					children: "دورة تحفيظ القرآن الكريم"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 font-display text-lg opacity-75",
					children: "﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
			onSubmit: submit,
			className: "rounded-t-[2rem] bg-background px-6 pt-8 pb-10 text-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-sm space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-bold",
						children: setup ? "إعداد حساب المشرف العام" : "تسجيل الدخول"
					}),
					setup && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الاسم الكامل" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value),
							required: true,
							className: "h-12"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "رقم الهاتف" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							dir: "ltr",
							inputMode: "tel",
							value: phone,
							onChange: (e) => setPhone(e.target.value),
							required: true,
							className: "h-12 text-right",
							placeholder: "07XXXXXXXX"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "كلمة المرور" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							required: true,
							className: "h-12"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "lg",
						className: "w-full",
						disabled: busy || !ready,
						children: busy ? "جارٍ الدخول…" : setup ? "إنشاء والدخول" : "دخول"
					}),
					!setup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm text-muted-foreground",
						children: "يحصل كل مسمّع وطالب على حسابه من المشرف"
					})
				]
			})
		})]
	});
}
//#endregion
export { Login as component };

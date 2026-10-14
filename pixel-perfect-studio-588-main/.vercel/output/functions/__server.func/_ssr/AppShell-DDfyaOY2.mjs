import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-CMJpCqdw.mjs";
import { D as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { r as useMe } from "./session-Bbxps4lU.mjs";
import { c as LogOut, d as BookOpen, i as Trophy, l as LayoutDashboard, n as User } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-DDfyaOY2.js
var import_jsx_runtime = require_jsx_runtime();
var roleLabel = {
	super_admin: "المشرف العام",
	supervisor: "المسمّع",
	student: "طالب"
};
function AppShell({ title, children }) {
	const { data: me } = useMe();
	const qc = useQueryClient();
	const navigate = useNavigate();
	async function signOut() {
		await qc.cancelQueries();
		qc.clear();
		await supabase.auth.signOut();
		navigate({
			to: "/",
			replace: true
		});
	}
	const nav = me?.role === "student" ? [{
		to: "/me",
		label: "صفحتي",
		icon: User
	}, {
		to: "/honor",
		label: "لوحة الشرف",
		icon: Trophy
	}] : [
		{
			to: "/halaqa",
			label: "الحلقة",
			icon: BookOpen
		},
		...me?.role === "super_admin" ? [{
			to: "/admin",
			label: "لوحة التحكم",
			icon: LayoutDashboard
		}] : [],
		{
			to: "/honor",
			label: "لوحة الشرف",
			icon: Trophy
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "bg-hero px-5 pt-6 pb-10 text-primary-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-3xl items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm opacity-80",
							children: ["صفوة الإخاء · ", me?.role ? roleLabel[me.role] : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl font-bold",
							children: title
						}),
						me?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm opacity-80",
							children: ["أهلاً، ", me.name]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: signOut,
						"aria-label": "تسجيل الخروج",
						className: "rounded-full bg-primary-foreground/15 p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-5 w-5" })
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto -mt-6 max-w-3xl px-4",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 border-t bg-card/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex max-w-3xl justify-around py-2",
					children: nav.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: n.to,
						className: "flex flex-col items-center gap-1 px-4 py-1 text-xs text-muted-foreground",
						activeProps: { className: "text-primary font-bold" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(n.icon, { className: "h-5 w-5" }), n.label]
					}, n.to))
				})
			})
		]
	});
}
function Panel({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: `rounded-2xl border bg-card p-4 shadow-soft ${className}`,
		children
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border bg-card p-4 text-center shadow-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xl font-extrabold text-primary",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-xs text-muted-foreground",
			children: label
		})]
	});
}
/** Animated skeleton placeholder — use while data is loading */
function CardSkeleton({ rows = 3 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 space-y-3 animate-pulse",
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border bg-card p-4 shadow-soft",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-1/2 rounded-full bg-muted mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-3/4 rounded-full bg-muted/70" })]
		}, i))
	});
}
//#endregion
export { Stat as i, CardSkeleton as n, Panel as r, AppShell as t };

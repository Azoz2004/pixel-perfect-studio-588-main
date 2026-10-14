import { o as ratingTone, r as fmtDate, t as LEVELS } from "./constants-D-h4F7u0.mjs";
import { t as supabase } from "./client-CMJpCqdw.mjs";
import { D as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as useMe } from "./session-Bbxps4lU.mjs";
import { i as Stat, n as CardSkeleton, r as Panel, t as AppShell } from "./AppShell-DDfyaOY2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/me-CL61gvyk.js
var import_jsx_runtime = require_jsx_runtime();
function Me() {
	const { data: me } = useMe();
	const { data, isLoading } = useQuery({
		queryKey: ["my-progress", me?.id],
		enabled: !!me,
		queryFn: async () => {
			const { data: st } = await supabase.from("students").select("*").eq("user_id", me.id).maybeSingle();
			if (!st) return null;
			const { data: recs } = await supabase.from("recitations").select("*").eq("student_id", st.id).order("created_at", { ascending: false });
			return {
				st,
				recs: recs ?? []
			};
		}
	});
	const recs = data?.recs ?? [];
	const total = recs.filter((r) => r.kind === "hifz").reduce((a, r) => a + (r.pages ?? 0), 0) + (data?.st.prior_pages ?? 0);
	const level = LEVELS.find((l) => l.id === data?.st.level);
	const pct = Math.min(100, Math.round(total / 604 * 100));
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "صفحتي",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-2 animate-pulse",
			children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border bg-card p-4 text-center shadow-soft",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-12 rounded-full bg-muted mx-auto mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-16 rounded-full bg-muted/70 mx-auto" })]
			}, i))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, { rows: 4 })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "صفحتي",
		children: !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			className: "text-center text-muted-foreground",
			children: "لم يُربط حسابك بملف طالب بعد"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["مستوى ", level?.name] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: level?.desc
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 h-3 overflow-hidden rounded-full bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full bg-primary",
							style: { width: `${pct}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-center text-sm text-muted-foreground",
						children: [
							total,
							" من 604 صفحة (",
							pct,
							"%)"
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "صفحات محفوظة",
							value: total
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "جلسات",
							value: recs.length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "التقييم العام",
							value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-lg",
								children: data.st.overall_rating
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "pt-2 font-bold",
					children: "سجل الجلسات"
				}),
				recs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					className: "text-center text-muted-foreground",
					children: "لا توجد جلسات بعد"
				}),
				recs.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-bold",
							children: [
								r.kind === "hifz" ? "حفظ" : "مراجعة",
								" · ص ",
								r.from_page,
								"–",
								r.to_page
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [
								r.mistakes,
								" أخطاء · ",
								fmtDate(r.created_at)
							]
						}),
						r.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-xs",
							children: r.notes
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `rounded-full px-2.5 py-1 text-xs font-bold ${ratingTone(r.rating ?? "")}`,
						children: r.rating
					})]
				}, r.id))
			]
		})
	});
}
//#endregion
export { Me as component };

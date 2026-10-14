import { r as __toESM } from "../_runtime.mjs";
import { t as LEVELS } from "./constants-D-h4F7u0.mjs";
import { t as supabase } from "./client-CMJpCqdw.mjs";
import { D as require_jsx_runtime, O as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as useMe } from "./session-Bbxps4lU.mjs";
import { a as Trash2, r as UserPlus } from "../_libs/lucide-react.mjs";
import { i as Stat, n as CardSkeleton, r as Panel, t as AppShell } from "./AppShell-DDfyaOY2.mjs";
import { l as deleteAccount, n as Input, r as Label, s as createStaff, t as Button } from "./accounts.functions-BpFPdYtl.mjs";
import { a as DialogTitle, i as DialogHeader, n as Dialog, r as DialogContent, t as ConfirmDialog } from "./dialog-DvqB9uq4.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-D7F1OTlP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Admin() {
	const { data: me } = useMe();
	const qc = useQueryClient();
	const [dlg, setDlg] = (0, import_react.useState)(null);
	const [toDelete, setToDelete] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const stats = useQuery({
		queryKey: ["admin-stats"],
		queryFn: async () => {
			const [{ data: st }, { data: recs }] = await Promise.all([supabase.from("students").select("id,level,supervisor_id,prior_pages"), supabase.from("recitations").select("pages,kind,rating,supervisor_id,created_at")]);
			return {
				students: st ?? [],
				recs: recs ?? []
			};
		}
	});
	const staff = useQuery({
		queryKey: ["staff"],
		queryFn: async () => {
			const { data: roles } = await supabase.from("user_roles").select("user_id,role").in("role", ["super_admin", "supervisor"]);
			const ids = [...new Set((roles ?? []).map((r) => r.user_id))];
			const { data: profs } = ids.length ? await supabase.from("profiles").select("id,full_name,phone").in("id", ids) : { data: [] };
			return (profs ?? []).map((p) => ({
				...p,
				role: roles.find((r) => r.user_id === p.id).role
			}));
		}
	});
	const s = stats.data;
	const pages = s?.recs.filter((r) => r.kind === "hifz").reduce((a, r) => a + (r.pages ?? 0), 0) ?? 0;
	const week = s?.recs.filter((r) => Date.now() - +new Date(r.created_at) < 6048e5).length ?? 0;
	const excellent = s?.recs.filter((r) => r.rating === "امتياز" || r.rating === "ممتاز").length ?? 0;
	if (stats.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "لوحة التحكم",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2 sm:grid-cols-4 animate-pulse",
			children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border bg-card p-4 text-center shadow-soft",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-16 rounded-full bg-muted mx-auto mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-20 rounded-full bg-muted/70 mx-auto" })]
			}, i))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, { rows: 3 })]
	});
	async function remove(id, name) {
		setToDelete({
			id,
			name
		});
	}
	async function confirmDelete() {
		if (!toDelete) return;
		setDeleting(true);
		try {
			await deleteAccount({ data: { userId: toDelete.id } });
			toast.success("تم الحذف");
			qc.invalidateQueries({ queryKey: ["staff"] });
		} catch (e) {
			toast.error(e.message);
		} finally {
			setDeleting(false);
			setToDelete(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "لوحة التحكم",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "الطلاب",
						value: s?.students.length ?? "…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "صفحات حفظ مسجلة",
						value: pages
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "جلسات هذا الأسبوع",
						value: week
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "جلسات متميزة",
						value: excellent
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-bold",
					children: "توزيع المستويات"
				}), LEVELS.map((l) => {
					const n = s?.students.filter((x) => x.level === l.id).length ?? 0;
					const pct = s?.students.length ? n / s.students.length * 100 : 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: l.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: n
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 h-2 rounded-full bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full bg-primary",
								style: { width: `${pct}%` }
							})
						})]
					}, l.id);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-bold",
						children: "المشرفون والمسمّعون"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => setDlg("supervisor"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, {}), "مسمّع"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => setDlg("super_admin"),
							children: "مشرف عام"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y",
					children: staff.data?.map((p) => {
						const count = s?.students.filter((x) => x.supervisor_id === p.id).length ?? 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold",
									children: p.full_name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									dir: "ltr",
									children: p.phone
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: p.role === "super_admin" ? "مشرف عام" : `مسمّع · ${count} طالب`
								})
							] }), p.id !== me?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								onClick: () => remove(p.id, p.full_name),
								"aria-label": "حذف",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "text-destructive" })
							})]
						}, p.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffDialog, {
				role: dlg,
				onClose: () => setDlg(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: !!toDelete,
				title: `حذف حساب ${toDelete?.name ?? ""}`,
				description: "سيُحذف هذا الحساب نهائياً ولن يتمكن صاحبه من الدخول. هذا الإجراء لا يمكن التراجع عنه.",
				confirmLabel: deleting ? "جارٍ الحذف…" : "حذف",
				destructive: true,
				onConfirm: confirmDelete,
				onCancel: () => setToDelete(null)
			})
		]
	});
}
function StaffDialog({ role, onClose }) {
	const qc = useQueryClient();
	const [f, setF] = (0, import_react.useState)({
		name: "",
		phone: "",
		password: ""
	});
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function go() {
		if (!role) return;
		setBusy(true);
		try {
			await createStaff({ data: {
				...f,
				role
			} });
			toast.success("تم إنشاء الحساب");
			qc.invalidateQueries({ queryKey: ["staff"] });
			qc.invalidateQueries({ queryKey: ["supervisors"] });
			setF({
				name: "",
				phone: "",
				password: ""
			});
			onClose();
		} catch (e) {
			toast.error(e.message);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: !!role,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			dir: "rtl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: role === "super_admin" ? "إضافة مشرف عام" : "إضافة مسمّع" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الاسم" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "h-11",
						value: f.name,
						onChange: (e) => setF({
							...f,
							name: e.target.value
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "رقم الهاتف" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						dir: "ltr",
						className: "h-11 text-right",
						value: f.phone,
						onChange: (e) => setF({
							...f,
							phone: e.target.value
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "كلمة المرور" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "h-11",
						value: f.password,
						onChange: (e) => setF({
							...f,
							password: e.target.value
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						size: "lg",
						onClick: go,
						disabled: busy,
						children: "إنشاء"
					})
				]
			})]
		})
	});
}
//#endregion
export { Admin as component };

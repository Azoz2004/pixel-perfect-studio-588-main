import { r as __toESM } from "../_runtime.mjs";
import { i as levelName, n as OVERALL_RATINGS, o as ratingTone, r as fmtDate, s as sessionRating, t as LEVELS } from "./constants-D-h4F7u0.mjs";
import { t as supabase } from "./client-CMJpCqdw.mjs";
import { D as require_jsx_runtime, O as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as useMe } from "./session-Bbxps4lU.mjs";
import { a as Trash2, o as Plus, r as UserPlus, s as Pencil, u as KeyRound } from "../_libs/lucide-react.mjs";
import { n as CardSkeleton, r as Panel, t as AppShell } from "./AppShell-DDfyaOY2.mjs";
import { c as createStudentAccount, n as Input, o as cn, r as Label, t as Button } from "./accounts.functions-BpFPdYtl.mjs";
import { a as DialogTitle, i as DialogHeader, n as Dialog, r as DialogContent, t as ConfirmDialog } from "./dialog-DvqB9uq4.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as TabsTrigger$1, n as TabsContent$1, r as TabsList$1, t as Tabs$1 } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/halaqa-G0DmHQ_x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StudentDialog({ open, onOpenChange, student, supervisors, onSaved }) {
	const { data: me } = useMe();
	const qc = useQueryClient();
	const [f, setF] = (0, import_react.useState)({
		full_name: "",
		phone: "",
		level: 1,
		prior_pages: 0,
		overall_rating: "جيد",
		supervisor_id: ""
	});
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open) setF(student ? { ...student } : {
			full_name: "",
			phone: "",
			level: 1,
			prior_pages: 0,
			overall_rating: "جيد",
			supervisor_id: me?.role === "supervisor" ? me.id : supervisors?.[0]?.id ?? ""
		});
	}, [
		open,
		student,
		me,
		supervisors
	]);
	async function save() {
		if (!f.full_name.trim()) {
			toast.error("اسم الطالب مطلوب");
			return;
		}
		if (!f.supervisor_id) {
			toast.error("اختر المسمّع");
			return;
		}
		setBusy(true);
		const payload = {
			full_name: f.full_name.trim(),
			phone: f.phone,
			level: f.level,
			prior_pages: f.prior_pages,
			overall_rating: f.overall_rating,
			supervisor_id: f.supervisor_id
		};
		const res = student ? await supabase.from("students").update(payload).eq("id", student.id).select("id").single() : await supabase.from("students").insert(payload).select("id").single();
		setBusy(false);
		if (res.error) {
			toast.error("تعذر الحفظ");
			return;
		}
		toast.success("تم الحفظ");
		qc.invalidateQueries({ queryKey: ["students"] });
		onSaved?.(res.data.id);
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			dir: "rtl",
			className: "max-h-[90vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: student ? "تعديل بيانات الطالب" : "طالب جديد" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الاسم" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "h-11",
						value: f.full_name,
						onChange: (e) => setF({
							...f,
							full_name: e.target.value
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "رقم الهاتف" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						dir: "ltr",
						className: "h-11 text-right",
						inputMode: "tel",
						value: f.phone,
						onChange: (e) => setF({
							...f,
							phone: e.target.value
						})
					})] }),
					me?.role === "super_admin" && supervisors && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "المسمّع" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 w-full rounded-md border bg-background px-3",
						value: f.supervisor_id,
						onChange: (e) => setF({
							...f,
							supervisor_id: e.target.value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "— اختر —"
						}), supervisors.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s.id,
							children: s.full_name
						}, s.id))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "المستوى" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 grid gap-2",
						children: LEVELS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setF({
								...f,
								level: l.id
							}),
							className: `rounded-xl border p-2.5 text-right ${f.level === l.id ? "border-primary bg-primary/10" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-bold",
								children: ["مستوى ", l.name]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: l.desc
							})]
						}, l.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الحفظ المسبق (عدد الصفحات)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						inputMode: "numeric",
						className: "h-11",
						value: f.prior_pages,
						onChange: (e) => setF({
							...f,
							prior_pages: +e.target.value || 0
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "التقييم العام" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 flex flex-wrap gap-2",
						children: OVERALL_RATINGS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setF({
								...f,
								overall_rating: r
							}),
							className: `rounded-full border px-3 py-1.5 text-sm ${f.overall_rating === r ? "border-primary bg-primary text-primary-foreground" : ""}`,
							children: r
						}, r))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						className: "w-full",
						onClick: save,
						disabled: busy,
						children: "حفظ"
					})
				]
			})]
		})
	});
}
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var Tabs = Tabs$1;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList$1, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = TabsList$1.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger$1, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = TabsTrigger$1.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent$1, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = TabsContent$1.displayName;
function useSupervisors(enabled) {
	return useQuery({
		queryKey: ["supervisors"],
		enabled,
		queryFn: async () => {
			const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "supervisor");
			const ids = (roles ?? []).map((r) => r.user_id);
			if (!ids.length) return [];
			const { data } = await supabase.from("profiles").select("id,full_name,phone").in("id", ids);
			return data ?? [];
		}
	});
}
function Halaqa() {
	const { data: me } = useMe();
	const { data: supervisors } = useSupervisors(me?.role === "super_admin");
	const students = useQuery({
		queryKey: ["students"],
		queryFn: async () => (await supabase.from("students").select("*").order("full_name")).data ?? []
	});
	const [dlg, setDlg] = (0, import_react.useState)({ open: false });
	const [selected, setSelected] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "الحلقة",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "log",
			dir: "rtl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid h-12 w-full grid-cols-3 rounded-xl bg-card shadow-soft",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "log",
							children: "تسميع"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "students",
							children: "الطلاب"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "history",
							children: "السجل"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "log",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogForm, {
						students: students.data ?? [],
						selected,
						setSelected,
						onNew: () => setDlg({ open: true })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "students",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentsList, {
						students: students.data ?? [],
						supervisors,
						onEdit: (s) => setDlg({
							open: true,
							student: s
						}),
						onNew: () => setDlg({ open: true })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "history",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, {})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentDialog, {
			open: dlg.open,
			onOpenChange: (o) => setDlg({ open: o }),
			student: dlg.student,
			supervisors,
			onSaved: (id) => {
				if (!dlg.student) setSelected(id);
			}
		})]
	});
}
function LogForm({ students, selected, setSelected, onNew }) {
	const qc = useQueryClient();
	const [kind, setKind] = (0, import_react.useState)("hifz");
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const [mistakes, setMistakes] = (0, import_react.useState)(0);
	const [notes, setNotes] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const rating = sessionRating(mistakes);
	const student = students.find((s) => s.id === selected);
	async function save() {
		if (!student) {
			toast.error("اختر الطالب");
			return;
		}
		if (!from || !to) {
			toast.error("أدخل الصفحات");
			return;
		}
		setBusy(true);
		const { error } = await supabase.from("recitations").insert({
			student_id: student.id,
			supervisor_id: student.supervisor_id,
			kind,
			from_page: +from,
			to_page: +to,
			mistakes,
			notes: notes || null
		});
		setBusy(false);
		if (error) {
			toast.error("تعذر الحفظ");
			return;
		}
		toast.success(`تم تسجيل الجلسة — ${rating}`);
		setFrom(to ? String(+to + 1) : "");
		setTo("");
		setMistakes(0);
		setNotes("");
		setKind("hifz");
		qc.invalidateQueries({ queryKey: ["recitations"] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "mt-3 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الطالب" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "mt-1 h-12 w-full rounded-xl border bg-background px-3 text-base",
						value: selected,
						onChange: (e) => setSelected(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "— اختر الطالب —"
						}), students.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s.id,
							children: s.full_name
						}, s.id))]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: "secondary",
					className: "h-12 w-12 rounded-xl",
					onClick: onNew,
					"aria-label": "طالب جديد",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, {})
				})]
			}),
			student && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"مستوى ",
					levelName(student.level),
					" · التقييم العام: ",
					student.overall_rating
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: ["التاريخ والوقت: ", (/* @__PURE__ */ new Date()).toLocaleString("ar", {
					dateStyle: "full",
					timeStyle: "short"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 rounded-xl bg-muted p-1",
				children: ["hifz", "review"].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setKind(k),
					className: `h-11 rounded-lg font-bold ${kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`,
					children: k === "hifz" ? "حفظ" : "مراجعة"
				}, k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "من صفحة" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					inputMode: "numeric",
					className: "h-12 text-lg",
					value: from,
					onChange: (e) => setFrom(e.target.value)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "إلى صفحة" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					inputMode: "numeric",
					className: "h-12 text-lg",
					value: to,
					onChange: (e) => setTo(e.target.value)
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "عدد الأخطاء" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "h-12 w-12 rounded-xl text-xl",
							onClick: () => setMistakes(Math.max(0, mistakes - 1)),
							children: "−"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 text-center text-3xl font-extrabold",
							children: mistakes
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "h-12 w-12 rounded-xl text-xl",
							onClick: () => setMistakes(mistakes + 1),
							children: "+"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `mt-3 rounded-xl py-2 text-center font-bold ${ratingTone(rating)}`,
					children: ["التقييم: ", rating]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "ملاحظات (اختياري)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: notes,
				onChange: (e) => setNotes(e.target.value),
				rows: 2
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				className: "w-full",
				onClick: save,
				disabled: busy,
				children: "حفظ الجلسة"
			})
		]
	});
}
function StudentsList({ students, supervisors, onEdit, onNew }) {
	const qc = useQueryClient();
	const [q, setQ] = (0, import_react.useState)("");
	const [acct, setAcct] = (0, import_react.useState)(null);
	const [toDelete, setToDelete] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const list = (0, import_react.useMemo)(() => students.filter((s) => s.full_name.includes(q)), [students, q]);
	const supName = (id) => supervisors?.find((s) => s.id === id)?.full_name;
	async function confirmDelete() {
		if (!toDelete) return;
		setDeleting(true);
		const { error } = await supabase.from("students").delete().eq("id", toDelete.id);
		setDeleting(false);
		setToDelete(null);
		if (error) {
			toast.error("تعذر الحذف");
			return;
		}
		toast.success("تم حذف الطالب");
		qc.invalidateQueries({ queryKey: ["students"] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "بحث عن طالب…",
					className: "h-11 bg-card",
					value: q,
					onChange: (e) => setQ(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "h-11",
					onClick: onNew,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "إضافة"]
				})]
			}),
			list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "text-center text-muted-foreground",
				children: "لا يوجد طلاب بعد"
			}),
			list.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-bold",
						children: s.full_name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [
							"مستوى ",
							levelName(s.level),
							" · ",
							s.overall_rating,
							supName(s.supervisor_id) ? ` · ${supName(s.supervisor_id)}` : "",
							s.user_id ? " · لديه حساب" : ""
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 gap-1",
					children: [
						!s.user_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "ghost",
							onClick: () => setAcct(s),
							"aria-label": "إنشاء حساب",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "ghost",
							onClick: () => onEdit(s),
							"aria-label": "تعديل",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "ghost",
							onClick: () => setToDelete(s),
							"aria-label": "حذف",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "text-destructive" })
						})
					]
				})]
			}, s.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountDialog, {
				student: acct,
				onClose: () => setAcct(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: !!toDelete,
				title: `حذف الطالب ${toDelete?.full_name ?? ""}`,
				description: "سيُحذف الطالب وجميع جلسات تسميعه بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.",
				confirmLabel: deleting ? "جارٍ الحذف…" : "حذف",
				destructive: true,
				onConfirm: confirmDelete,
				onCancel: () => setToDelete(null)
			})
		]
	});
}
function AccountDialog({ student, onClose }) {
	const qc = useQueryClient();
	const [phone, setPhone] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const effectivePhone = phone || student?.phone || "";
	function handleOpenChange(open) {
		if (!open) {
			onClose();
			setPhone("");
			setPassword("");
		} else {
			setPhone(student?.phone ?? "");
			setPassword("");
		}
	}
	async function go() {
		if (!student) return;
		if (!password || password.length < 6) {
			toast.error("كلمة المرور 6 أحرف على الأقل");
			return;
		}
		setBusy(true);
		try {
			await createStudentAccount({ data: {
				studentId: student.id,
				name: student.full_name,
				phone: effectivePhone,
				password
			} });
			toast.success("تم إنشاء حساب الطالب");
			qc.invalidateQueries({ queryKey: ["students"] });
			onClose();
			setPhone("");
			setPassword("");
		} catch (e) {
			toast.error(e.message);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: !!student,
		onOpenChange: handleOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			dir: "rtl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["حساب دخول لـ ", student?.full_name] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "رقم الهاتف" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						dir: "ltr",
						className: "h-11 text-right",
						value: effectivePhone,
						onChange: (e) => setPhone(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "كلمة المرور" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						className: "h-11",
						placeholder: "6 أحرف على الأقل",
						value: password,
						onChange: (e) => setPassword(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						size: "lg",
						onClick: go,
						disabled: busy || !password,
						children: busy ? "جارٍ الإنشاء…" : "إنشاء الحساب"
					})
				]
			})]
		})
	});
}
function History() {
	const qc = useQueryClient();
	const [toDelete, setToDelete] = (0, import_react.useState)(null);
	const { data, isLoading } = useQuery({
		queryKey: ["recitations", "recent"],
		queryFn: async () => (await supabase.from("recitations").select("*, students(full_name)").order("created_at", { ascending: false }).limit(50)).data ?? []
	});
	async function confirmDelete() {
		if (!toDelete) return;
		await supabase.from("recitations").delete().eq("id", toDelete);
		setToDelete(null);
		qc.invalidateQueries({ queryKey: ["recitations"] });
		toast.success("تم حذف الجلسة");
	}
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, { rows: 4 });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 space-y-2",
		children: [
			!data?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "text-center text-muted-foreground",
				children: "لا توجد جلسات بعد"
			}),
			data?.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-bold",
							children: r.students?.full_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [
								r.kind === "hifz" ? "حفظ" : "مراجعة",
								" · ص ",
								r.from_page,
								"–",
								r.to_page,
								" · ",
								r.mistakes,
								" أخطاء · ",
								fmtDate(r.created_at)
							]
						}),
						r.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-xs",
							children: r.notes
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `rounded-full px-2.5 py-1 text-xs font-bold ${ratingTone(r.rating ?? "")}`,
						children: r.rating
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						onClick: () => setToDelete(r.id),
						"aria-label": "حذف",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "text-destructive" })
					})]
				})]
			}, r.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: !!toDelete,
				title: "حذف الجلسة",
				description: "هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.",
				confirmLabel: "حذف",
				destructive: true,
				onConfirm: confirmDelete,
				onCancel: () => setToDelete(null)
			})
		]
	});
}
//#endregion
export { Halaqa as component, useSupervisors };

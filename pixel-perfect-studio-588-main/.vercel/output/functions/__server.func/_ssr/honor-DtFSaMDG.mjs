import { t as supabase } from "./client-CMJpCqdw.mjs";
import { D as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as Trophy } from "../_libs/lucide-react.mjs";
import { r as Panel, t as AppShell } from "./AppShell-DDfyaOY2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/honor-DtFSaMDG.js
var import_jsx_runtime = require_jsx_runtime();
function Honor() {
	const { data } = useQuery({
		queryKey: ["honor"],
		queryFn: async () => (await supabase.rpc("honor_board")).data ?? []
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "لوحة الشرف",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 rounded-xl bg-card p-3 text-center text-sm text-muted-foreground shadow-soft",
			children: "المتميزون خلال آخر 30 يوماً"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [!data?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "text-center text-muted-foreground",
				children: "لا يوجد متميزون بعد"
			}), data?.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `flex h-11 w-11 items-center justify-center rounded-full font-extrabold ${i < 3 ? "bg-accent text-accent-foreground" : "bg-muted"}`,
					children: i < 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "h-5 w-5" }) : i + 1
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-bold",
						children: s.full_name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [
							s.excellent,
							" جلسة متميزة · ",
							s.total_pages,
							" صفحة حفظ"
						]
					})]
				})]
			}, i))]
		})]
	});
}
//#endregion
export { Honor as component };

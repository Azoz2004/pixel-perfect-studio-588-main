import { r as __toESM } from "../_runtime.mjs";
import { K as redirect, _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRouteWithContext, x as useRouter, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-CMJpCqdw.mjs";
import { D as require_jsx_runtime, O as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as fetchMe } from "./session-Bbxps4lU.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Cp5IAuaS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var styles_default = "/assets/styles-DTSHXDds.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message: describeThrown(error),
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var MAX_SERIALIZED_LENGTH = 2e3;
function describeThrown(error) {
	if (error instanceof Response) return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	const { message } = error ?? {};
	if (typeof message === "string" && message.length > 0) return message;
	try {
		return JSON.stringify(error)?.slice(0, MAX_SERIALIZED_LENGTH) ?? String(error);
	} catch {
		return String(error);
	}
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center",
		dir: "rtl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-7xl font-bold text-primary",
				children: "٤٠٤"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-4 text-xl font-semibold",
				children: "الصفحة غير موجودة"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
				children: "العودة للرئيسية"
			})
		]
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center",
		dir: "rtl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-5xl",
				children: "⚠️"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 text-xl font-semibold",
				children: "حدث خطأ غير متوقع"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "يمكنك المحاولة مجدداً أو العودة للصفحة الرئيسية."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						router.invalidate();
						reset();
					},
					className: "inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
					children: "المحاولة مجدداً"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/",
					className: "inline-flex items-center justify-center rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent",
					children: "الرئيسية"
				})]
			})
		]
	});
}
var Route$6 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "صفوة الإخاء — دورة تحفيظ القرآن" },
			{
				name: "description",
				content: "متابعة الحفظ والتسميع اليومي لطلاب دورة صفوة الإخاء"
			},
			{
				name: "theme-color",
				content: "#2f6f55"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon.png"
			},
			{
				rel: "apple-touch-icon",
				href: "/icon-512.png"
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700;800&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "ar",
		dir: "rtl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$6.useRouteContext();
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		const { data } = supabase.auth.onAuthStateChange((event) => {
			if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
			if (event === "SIGNED_OUT") queryClient.clear();
			else queryClient.invalidateQueries();
			router.invalidate();
		});
		return () => data.subscription.unsubscribe();
	}, [queryClient, router]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			position: "top-center",
			richColors: true
		})]
	});
}
var $$splitComponentImporter$5 = () => import("./routes-DJXZGGO_.mjs");
var Route$5 = createFileRoute("/")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "تسجيل الدخول — صفوة الإخاء" },
		{
			name: "description",
			content: "ادخل برقم هاتفك لمتابعة حلقات التحفيظ والتسميع في دورة صفوة الإخاء."
		},
		{
			property: "og:title",
			content: "صفوة الإخاء — دورة تحفيظ القرآن"
		},
		{
			property: "og:description",
			content: "متابعة الحفظ والتسميع اليومي والتقييمات ولوحة الشرف."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./route-Di7iQBCH.mjs");
var Route$4 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data } = await supabase.auth.getUser();
		if (!data.user) throw redirect({ to: "/" });
	},
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./admin-D7F1OTlP.mjs");
var Route$3 = createFileRoute("/_authenticated/admin")({
	ssr: false,
	beforeLoad: async () => {
		if ((await fetchMe())?.role !== "super_admin") throw redirect({ to: "/halaqa" });
	},
	head: () => ({ meta: [{ title: "لوحة التحكم — صفوة الإخاء" }, {
		name: "description",
		content: "إحصائيات الدورة وإدارة المشرفين والمسمّعين."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./halaqa-G0DmHQ_x.mjs");
var Route$2 = createFileRoute("/_authenticated/halaqa")({
	ssr: false,
	beforeLoad: async () => {
		if ((await fetchMe())?.role === "student") throw redirect({ to: "/me" });
	},
	head: () => ({ meta: [{ title: "الحلقة — صفوة الإخاء" }, {
		name: "description",
		content: "تسجيل جلسات التسميع وإدارة طلاب الحلقة."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./honor-DtFSaMDG.mjs");
var Route$1 = createFileRoute("/_authenticated/honor")({
	ssr: false,
	head: () => ({ meta: [{ title: "لوحة الشرف — صفوة الإخاء" }, {
		name: "description",
		content: "المتميزون في الحفظ خلال آخر 30 يوماً."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./me-CL61gvyk.mjs");
var Route = createFileRoute("/_authenticated/me")({
	ssr: false,
	head: () => ({ meta: [{ title: "صفحتي — صفوة الإخاء" }, {
		name: "description",
		content: "تقدمك في الحفظ وسجل جلساتك وتقييماتك."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$6
});
var AuthenticatedRouteRoute = Route$4.update({
	id: "/_authenticated",
	getParentRoute: () => Route$6
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAdminRoute: Route$3.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedHalaqaRoute: Route$2.update({
		id: "/halaqa",
		path: "/halaqa",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedHonorRoute: Route$1.update({
		id: "/honor",
		path: "/honor",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedMeRoute: Route.update({
		id: "/me",
		path: "/me",
		getParentRoute: () => AuthenticatedRouteRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren)
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };

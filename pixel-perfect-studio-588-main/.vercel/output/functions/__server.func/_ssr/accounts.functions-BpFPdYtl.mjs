import { r as __toESM } from "../_runtime.mjs";
import { a as TSS_SERVER_FUNCTION, l as createServerFn } from "./createServerFn-BhqelEmK.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-CMevzYJH.mjs";
import { D as require_jsx_runtime, O as require_react, w as Slot } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-Cv0WsQm-.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Label$1 } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/accounts.functions-BpFPdYtl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			hero: "bg-primary-foreground text-primary font-bold shadow-soft hover:bg-primary-foreground/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-12 rounded-xl px-8 text-base",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Label$1.displayName;
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var bootstrapAdmin = createServerFn({ method: "POST" }).inputValidator((d) => d).handler(createSsrRpc("cae8c00623ff8792b2fd5737142e3ecc564c65bbc278c6ce17817b41bc7af529"));
var createStaff = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("6687b5862735cdb048f8a10c652352f47ff2a8b866ef1d9240d573cbb7544b17"));
var createStudentAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("052a947531bcb9b0ec8f56b00e7481515f12c171fa7e415dff410e4b40281f7d"));
var deleteAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("e2a7326b26c24ee3e783e02f49a20bc8676dbf989282f6ae61eda9a99b17e47d"));
//#endregion
export { buttonVariants as a, createStudentAccount as c, bootstrapAdmin as i, deleteAccount as l, Input as n, cn as o, Label as r, createStaff as s, Button as t };

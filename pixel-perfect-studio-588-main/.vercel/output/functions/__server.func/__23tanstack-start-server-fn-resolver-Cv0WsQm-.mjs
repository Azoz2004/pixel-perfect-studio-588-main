//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-Cv0WsQm-.js
var manifest = {
	"052a947531bcb9b0ec8f56b00e7481515f12c171fa7e415dff410e4b40281f7d": {
		functionName: "createStudentAccount_createServerFn_handler",
		importer: () => import("./_ssr/accounts.functions-DVg2gYkK.mjs")
	},
	"6687b5862735cdb048f8a10c652352f47ff2a8b866ef1d9240d573cbb7544b17": {
		functionName: "createStaff_createServerFn_handler",
		importer: () => import("./_ssr/accounts.functions-DVg2gYkK.mjs")
	},
	"cae8c00623ff8792b2fd5737142e3ecc564c65bbc278c6ce17817b41bc7af529": {
		functionName: "bootstrapAdmin_createServerFn_handler",
		importer: () => import("./_ssr/accounts.functions-DVg2gYkK.mjs")
	},
	"e2a7326b26c24ee3e783e02f49a20bc8676dbf989282f6ae61eda9a99b17e47d": {
		functionName: "deleteAccount_createServerFn_handler",
		importer: () => import("./_ssr/accounts.functions-DVg2gYkK.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ??= await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };

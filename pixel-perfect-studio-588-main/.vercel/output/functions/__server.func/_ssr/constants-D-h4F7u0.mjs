//#region node_modules/.nitro/vite/services/ssr/assets/constants-D-h4F7u0.js
var LEVELS = [
	{
		id: 1,
		name: "السفرة",
		desc: "10 صفحات أسبوعياً · سنة ونصف",
		weekly: 10
	},
	{
		id: 2,
		name: "الكرام",
		desc: "5 صفحات أسبوعياً · 3 سنين",
		weekly: 5
	},
	{
		id: 3,
		name: "البررة",
		desc: "3 صفحات أسبوعياً · 5 سنين",
		weekly: 3
	},
	{
		id: 4,
		name: "الدؤوبين",
		desc: "صفحتان أسبوعياً · 7 سنين",
		weekly: 2
	},
	{
		id: 5,
		name: "الأوابين",
		desc: "آية كل يوم",
		weekly: 0
	}
];
var OVERALL_RATINGS = [
	"امتياز",
	"جيد جداً",
	"جيد",
	"متوسط",
	"ضعيف"
];
var levelName = (l) => LEVELS.find((x) => x.id === l)?.name ?? "";
function sessionRating(m) {
	if (m <= 1) return "امتياز";
	if (m === 2) return "ممتاز";
	if (m === 3) return "جيد جداً";
	if (m === 4) return "جيد";
	return "يحتاج إعادة";
}
function ratingTone(r) {
	if (r === "امتياز" || r === "ممتاز") return "bg-success/15 text-success";
	if (r === "جيد جداً" || r === "جيد") return "bg-warning/20 text-accent-foreground";
	return "bg-destructive/15 text-destructive";
}
var phoneToEmail = (phone) => `${phone.replace(/[^\d]/g, "")}@safwa.app`;
var fmtDate = (d) => new Date(d).toLocaleString("ar", {
	dateStyle: "medium",
	timeStyle: "short"
});
//#endregion
export { phoneToEmail as a, levelName as i, OVERALL_RATINGS as n, ratingTone as o, fmtDate as r, sessionRating as s, LEVELS as t };

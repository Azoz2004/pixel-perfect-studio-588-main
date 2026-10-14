import { useState } from "react";
import { Check, ChevronsUpDown, Search, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { levelName } from "@/lib/constants";
import type { Student } from "@/components/StudentDialog";

export function StudentCombobox({
  students,
  value,
  onChange,
}: {
  students: Student[];
  value: string;
  onChange: (studentId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedStudent = students.find((s) => s.id === value);
  const filtered = students.filter((s) => s.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="mt-1 flex h-12 w-full items-center justify-between rounded-xl border border-input bg-card px-3 text-base shadow-sm hover:border-primary/60 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 text-right cursor-pointer"
        >
          {selectedStudent ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary shrink-0">
                {selectedStudent.full_name.slice(0, 1)}
              </span>
              <span className="font-bold truncate text-sm">{selectedStudent.full_name}</span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground shrink-0">
                مستوى {levelName(selectedStudent.level)}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm flex items-center gap-2">
              <User className="h-4 w-4 opacity-50" />
              — اضغط لاختيار أو البحث عن طالب —
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2.5rem)] max-w-sm p-2 shadow-xl rounded-2xl border" align="start" dir="rtl">
        {/* حقل البحث السريع */}
        <div className="relative mb-2">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو المستوى…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border bg-background pr-9 pl-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            autoFocus
          />
        </div>

        {/* قائمة الطلاب */}
        <div className="max-h-60 overflow-y-auto space-y-1 pr-0.5">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">لا يوجد طالب بهذا الاسم</div>
          ) : (
            filtered.map((s) => {
              const isSelected = s.id === value;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onChange(s.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold shrink-0 ${
                        isSelected ? "bg-primary-foreground/20 text-white" : "bg-primary/10 text-primary"
                      }`}
                    >
                      {s.full_name.slice(0, 1)}
                    </span>
                    <span className="truncate">{s.full_name}</span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] shrink-0 font-medium ${
                        isSelected ? "bg-primary-foreground/20 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {levelName(s.level)}
                    </span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 shrink-0 mr-1" />}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

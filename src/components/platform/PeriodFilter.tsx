import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  RANGE_PRESETS,
  dateParts,
  istanbulDateTime,
  makeAbsoluteRange,
  makeRelativeRange,
  parseQuickRange,
  timeParts,
  type PlatformRangeValue,
  type RangePresetId,
} from "@/pages/platform/range";

function TimeField({
  value,
  onChange,
}: {
  value: { hour: string; minute: string; second: string };
  onChange: (next: { hour: string; minute: string; second: string }) => void;
}) {
  const clamp = (raw: string, max: number) => {
    const n = parseInt(raw.replace(/\D/g, ""), 10);
    if (!Number.isFinite(n)) return "00";
    return String(Math.min(max, Math.max(0, n))).padStart(2, "0");
  };

  return (
    <div className="flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1.5 font-mono text-sm">
      <input
        className="w-7 bg-transparent text-center outline-none"
        value={value.hour}
        onChange={(e) => onChange({ ...value, hour: e.target.value })}
        onBlur={() => onChange({ ...value, hour: clamp(value.hour, 23) })}
        inputMode="numeric"
        aria-label="Saat"
      />
      <span className="text-muted-foreground">:</span>
      <input
        className="w-7 bg-transparent text-center outline-none"
        value={value.minute}
        onChange={(e) => onChange({ ...value, minute: e.target.value })}
        onBlur={() => onChange({ ...value, minute: clamp(value.minute, 59) })}
        inputMode="numeric"
        aria-label="Dakika"
      />
      <span className="text-muted-foreground">:</span>
      <input
        className="w-7 bg-transparent text-center outline-none"
        value={value.second}
        onChange={(e) => onChange({ ...value, second: e.target.value })}
        onBlur={() => onChange({ ...value, second: clamp(value.second, 59) })}
        inputMode="numeric"
        aria-label="Saniye"
      />
    </div>
  );
}

export function PeriodFilter({
  value,
  onChange,
}: {
  value: PlatformRangeValue;
  onChange: (next: PlatformRangeValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [quick, setQuick] = useState("");
  const [draftRange, setDraftRange] = useState<DateRange | undefined>();
  const [startTime, setStartTime] = useState({ hour: "00", minute: "00", second: "00" });
  const [endTime, setEndTime] = useState({ hour: "23", minute: "59", second: "59" });
  const [activePreset, setActivePreset] = useState<RangePresetId>(value.presetId);

  const syncDraftFromValue = (v: PlatformRangeValue) => {
    const fromParts = dateParts(v.from);
    const toParts = dateParts(v.to);
    setDraftRange({
      from: new Date(fromParts.year, fromParts.month - 1, fromParts.day),
      to: new Date(toParts.year, toParts.month - 1, toParts.day),
    });
    setStartTime(timeParts(v.from));
    setEndTime(timeParts(v.to));
    setActivePreset(v.presetId);
  };

  useEffect(() => {
    if (open) {
      syncDraftFromValue(value);
      setQuick("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const draftAbsolute = useMemo(() => {
    if (!draftRange?.from) return null;
    const fy = draftRange.from.getFullYear();
    const fm = draftRange.from.getMonth() + 1;
    const fd = draftRange.from.getDate();
    const toDate = draftRange.to ?? draftRange.from;
    const ty = toDate.getFullYear();
    const tm = toDate.getMonth() + 1;
    const td = toDate.getDate();
    const from = istanbulDateTime(
      fy,
      fm,
      fd,
      parseInt(startTime.hour, 10) || 0,
      parseInt(startTime.minute, 10) || 0,
      parseInt(startTime.second, 10) || 0,
    );
    const to = istanbulDateTime(
      ty,
      tm,
      td,
      parseInt(endTime.hour, 10) || 0,
      parseInt(endTime.minute, 10) || 0,
      parseInt(endTime.second, 10) || 0,
    );
    return makeAbsoluteRange(from, to);
  }, [draftRange, startTime, endTime]);

  const applyPreset = (id: Exclude<RangePresetId, "custom">) => {
    onChange(makeRelativeRange(id));
    setOpen(false);
  };

  const applyDraft = () => {
    if (!draftAbsolute) return;
    onChange(draftAbsolute);
    setOpen(false);
  };

  const applyQuick = () => {
    const parsed = parseQuickRange(quick);
    if (!parsed) return;
    onChange(parsed);
    setOpen(false);
  };

  const jumpToday = () => {
    const now = new Date();
    const p = dateParts(now);
    const day = new Date(p.year, p.month - 1, p.day);
    setDraftRange({ from: day, to: day });
    setStartTime({ hour: "00", minute: "00", second: "00" });
    setEndTime(timeParts(now));
    setActivePreset("custom");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 font-normal">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[260px] truncate">{value.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto max-w-[calc(100vw-2rem)] p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full border-b border-border p-3 sm:w-52 sm:border-b-0 sm:border-r">
            <Input
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyQuick();
              }}
              placeholder="örn. 2h, 30m, 7d"
              className="h-8 text-sm"
            />
            <div className="mt-2 space-y-0.5">
              {RANGE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={cn(
                    "flex w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                    activePreset === p.id && value.presetId === p.id
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <TimeField
                value={startTime}
                onChange={(t) => {
                  setStartTime(t);
                  setActivePreset("custom");
                }}
              />
              <span className="text-xs text-muted-foreground">→</span>
              <TimeField
                value={endTime}
                onChange={(t) => {
                  setEndTime(t);
                  setActivePreset("custom");
                }}
              />
            </div>

            <Calendar
              mode="range"
              numberOfMonths={1}
              selected={draftRange}
              onSelect={(r) => {
                setDraftRange(r);
                setActivePreset("custom");
              }}
              disabled={{ after: new Date() }}
              initialFocus
            />

            <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-3">
              <Button type="button" variant="outline" size="sm" onClick={jumpToday}>
                Bugün
              </Button>
              <Button type="button" size="sm" onClick={applyDraft} disabled={!draftAbsolute}>
                Uygula
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

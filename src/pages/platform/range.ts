import { useCallback, useState } from "react";

export type PlatformKpi = {
  merchants: number;
  stamps_period: number;
  cards_period: number;
  rewards_period: number;
  stamps_total: number;
  cards_total: number;
  rewards_total: number;
};

export type PlatformBucket = {
  bucket: string;
  stamps: number;
  cards: number;
  rewards: number;
};

export type RangePresetId = "15m" | "1h" | "8h" | "24h" | "7d" | "custom";

export type PlatformRangeValue = {
  from: Date;
  to: Date;
  label: string;
  presetId: RangePresetId;
  granularity: "hour" | "day";
};

export const RANGE_PRESETS: {
  id: Exclude<RangePresetId, "custom">;
  label: string;
  ms: number;
}[] = [
  { id: "15m", label: "Son 15 dakika", ms: 15 * 60 * 1000 },
  { id: "1h", label: "Son 1 saat", ms: 60 * 60 * 1000 },
  { id: "8h", label: "Son 8 saat", ms: 8 * 60 * 60 * 1000 },
  { id: "24h", label: "Son 24 saat", ms: 24 * 60 * 60 * 1000 },
  { id: "7d", label: "Son 7 gün", ms: 7 * 24 * 60 * 60 * 1000 },
];

export function granularityFor(from: Date, to: Date): "hour" | "day" {
  const ms = Math.max(0, to.getTime() - from.getTime());
  return ms <= 48 * 60 * 60 * 1000 ? "hour" : "day";
}

export function formatRangeLabel(from: Date, to: Date, presetId: RangePresetId): string {
  if (presetId !== "custom") {
    return RANGE_PRESETS.find((p) => p.id === presetId)?.label ?? "Özel aralık";
  }
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  };
  return `${from.toLocaleString("tr-TR", opts)} – ${to.toLocaleString("tr-TR", opts)}`;
}

export function makeRelativeRange(presetId: Exclude<RangePresetId, "custom">): PlatformRangeValue {
  const preset = RANGE_PRESETS.find((p) => p.id === presetId)!;
  const to = new Date();
  const from = new Date(to.getTime() - preset.ms);
  return {
    from,
    to,
    label: preset.label,
    presetId,
    granularity: granularityFor(from, to),
  };
}

export function makeAbsoluteRange(from: Date, to: Date): PlatformRangeValue {
  const start = from.getTime() <= to.getTime() ? from : to;
  const end = from.getTime() <= to.getTime() ? to : from;
  return {
    from: start,
    to: end,
    label: formatRangeLabel(start, end, "custom"),
    presetId: "custom",
    granularity: granularityFor(start, end),
  };
}

/** Parse quick strings like "15m", "2h", "7d". */
export function parseQuickRange(input: string): PlatformRangeValue | null {
  const raw = input.trim().toLowerCase().replace(/\s+/g, "");
  const m = raw.match(/^(\d+)(m|min|h|sa|d|g)$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  const unit = m[2];
  let ms = 0;
  if (unit === "m" || unit === "min") ms = n * 60 * 1000;
  else if (unit === "h" || unit === "sa") ms = n * 60 * 60 * 1000;
  else ms = n * 24 * 60 * 60 * 1000;
  if (ms > 90 * 24 * 60 * 60 * 1000) return null;
  const to = new Date();
  const from = new Date(to.getTime() - ms);
  return {
    from,
    to,
    label: formatQuickLabel(n, unit),
    presetId: "custom",
    granularity: granularityFor(from, to),
  };
}

function formatQuickLabel(n: number, unit: string) {
  if (unit === "m" || unit === "min") return `Son ${n} dakika`;
  if (unit === "h" || unit === "sa") return `Son ${n} saat`;
  return `Son ${n} gün`;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function timeParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return { hour: get("hour") === "24" ? "00" : get("hour"), minute: get("minute"), second: get("second") };
}

export function dateParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "01";
  return {
    year: parseInt(get("year"), 10),
    month: parseInt(get("month"), 10),
    day: parseInt(get("day"), 10),
  };
}

/** Build a Date from Istanbul calendar date + time (TR is permanently UTC+3). */
export function istanbulDateTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
): Date {
  const iso = `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:${pad2(second)}+03:00`;
  return new Date(iso);
}

export function usePlatformRange() {
  const [value, setValue] = useState<PlatformRangeValue>(() => makeRelativeRange("24h"));

  const applyPreset = useCallback((id: Exclude<RangePresetId, "custom">) => {
    setValue(makeRelativeRange(id));
  }, []);

  const applyCustom = useCallback((from: Date, to: Date) => {
    setValue(makeAbsoluteRange(from, to));
  }, []);

  return {
    ...value,
    since: value.from,
    until: value.to,
    setValue,
    applyPreset,
    applyCustom,
  };
}

/**
 * Client-side CSV helpers for the event participant register (Phase 6).
 * No dependencies — a Blob + object URL is enough for a download.
 */

export interface RegisterRow {
  name: string;
  email: string;
  participants: number;
}

/** RFC4180-ish escaping: quote when the value contains a comma, quote or newline. */
export const escapeCsvValue = (value: unknown): string => {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Build the register CSV (header row + one row per booking). */
export const buildRegisterCsv = (rows: RegisterRow[]): string =>
  [
    ["name", "email", "participants"].join(","),
    ...rows.map((r) => [r.name, r.email, r.participants].map(escapeCsvValue).join(",")),
  ].join("\r\n");

/** URL-safe slug used in the download filename. */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "event";

export const registerFileName = (title: string, date: string): string =>
  `summitfit-${slugify(title)}-${date}.csv`;

/** Leading BOM so Excel opens UTF-8 names correctly. */
const CSV_BOM = "\uFEFF";

/** Trigger a browser download of `content` as `filename`. */
export const downloadCsv = (filename: string, content: string): void => {
  const blob = new Blob([CSV_BOM + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

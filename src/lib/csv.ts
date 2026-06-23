/** Minimal client-side CSV export (no dependency). */

const escapeCell = (value: unknown): string => {
  const s = value == null ? "" : String(value);
  // Quote if the cell contains a comma, quote, or newline.
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Build a CSV string from rows and a column spec, then trigger a download.
 * @param filename e.g. "clients.csv"
 * @param columns  ordered [header, accessor] pairs
 * @param rows     the data
 */
export function downloadCsv<T>(
  filename: string,
  columns: [header: string, accessor: (row: T) => unknown][],
  rows: T[]
): void {
  const headerLine = columns.map(([h]) => escapeCell(h)).join(",");
  const dataLines = rows.map((row) =>
    columns.map(([, accessor]) => escapeCell(accessor(row))).join(",")
  );
  const csv = [headerLine, ...dataLines].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

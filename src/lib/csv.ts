// Adobe Stock CSV format:
// Filename,Title,Keywords,Category,Releases
// https://helpx.adobe.com/stock/contributor/help/csv-keywording.html
import type { StockMetadata } from "./gemini";

export interface CsvRow {
  filename: string;
  meta: StockMetadata;
}

function escape(field: string): string {
  if (/[",\n\r]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function buildAdobeCsv(rows: CsvRow[]): string {
  const hasDescription = rows.some((r) => r.meta.description);
  const header = hasDescription
    ? ["Filename", "Title", "Description", "Keywords", "Category", "Releases"]
    : ["Filename", "Title", "Keywords", "Category", "Releases"];
  const lines = [header.join(",")];
  for (const r of rows) {
    const base = [escape(r.filename), escape(r.meta.title)];
    if (hasDescription) base.push(escape(r.meta.description ?? ""));
    base.push(escape(r.meta.keywords.join(", ")), String(r.meta.category), "");
    lines.push(base.join(","));
  }
  return lines.join("\r\n");
}

export function downloadText(filename: string, content: string, mime = "text/csv") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

"use client";

import { useCallback, useId, useState } from "react";
import { notify } from "@/lib/toast";

type FileDropzoneProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  /** Called with the count of newly added PDFs (after dedupe). */
  onFilesAdded?: (count: number) => void;
  /** Optional hook when non-PDF files are rejected. Toast is always shown. */
  onReject?: (message: string) => void;
  disabled?: boolean;
  accept?: string;
};

function isPdf(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function formatSizeKb(bytes: number) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function FileDropzone({
  files,
  onFilesChange,
  onFilesAdded,
  onReject,
  disabled = false,
  accept = "application/pdf,.pdf",
}: FileDropzoneProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  const mergeFiles = useCallback(
    (incoming: FileList | File[]) => {
      const all = Array.from(incoming);
      if (all.length === 0) return;

      const pdfs = all.filter(isPdf);
      const rejected = all.length - pdfs.length;

      if (rejected > 0) {
        const message =
          rejected === 1
            ? "Only PDF files are allowed"
            : `${rejected} non-PDF files were skipped`;
        notify.error(message);
        onReject?.(message);
      }

      if (pdfs.length === 0) return;

      const byKey = new Map<string, File>();
      for (const file of files) {
        byKey.set(fileKey(file), file);
      }
      const before = byKey.size;
      for (const file of pdfs) {
        byKey.set(fileKey(file), file);
      }
      const next = Array.from(byKey.values());
      const added = next.length - before;

      onFilesChange(next);
      if (added > 0) onFilesAdded?.(added);
    },
    [files, onFilesAdded, onFilesChange, onReject],
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const clearAll = () => onFilesChange([]);

  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          mergeFiles(e.dataTransfer.files);
        }}
        className={[
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-4 py-8 text-center transition-colors",
          disabled
            ? "cursor-not-allowed border-[var(--border)] bg-[var(--surface-muted)] opacity-60"
            : dragging
              ? "border-[var(--accent)] bg-[var(--accent-soft)]"
              : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]",
        ].join(" ")}
      >
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) mergeFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="text-sm font-medium text-[var(--foreground)]">
          Drop label PDFs here
        </span>
        <span className="max-w-sm text-sm text-[var(--muted)]">
          Meesho, Flipkart, or Amazon shipping labels
        </span>
        <span className="mt-1 text-xs font-medium text-[var(--accent)]">
          Browse files
        </span>
      </label>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-[var(--muted)]">
              {files.length} file{files.length === 1 ? "" : "s"} selected
            </p>
            <button
              type="button"
              onClick={clearAll}
              disabled={disabled}
              className="text-sm font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline disabled:opacity-50"
            >
              Clear all
            </button>
          </div>
          <ul className="divide-y divide-[var(--border)] rounded-md border border-[var(--border)] bg-[var(--surface)]">
            {files.map((file, index) => (
              <li
                key={fileKey(file)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm"
              >
                <span className="min-w-0 flex-1 truncate font-medium text-[var(--foreground)]">
                  {file.name}
                </span>
                <span className="shrink-0 tabular-nums text-[var(--muted)]">
                  {formatSizeKb(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                  className="shrink-0 text-[var(--muted)] underline-offset-2 hover:text-[var(--danger)] hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

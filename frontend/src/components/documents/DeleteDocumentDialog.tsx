import { LoaderCircle, Trash2, X } from "lucide-react";
import { useEffect } from "react";

export function DeleteDocumentDialog({
  title,
  deleting,
  onCancel,
  onConfirm,
}: {
  title: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleting, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-950/35 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-document-title"
        aria-describedby="delete-document-description"
        className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-700">
            <Trash2 size={20} />
          </span>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            aria-label="Close delete confirmation"
            className="grid size-9 place-items-center rounded-lg text-ink-500 transition hover:bg-canvas disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>
        <h2
          id="delete-document-title"
          className="mt-5 text-xl font-bold tracking-[-0.03em]"
        >
          Delete this document?
        </h2>
        <p id="delete-document-description" className="mt-2 text-ink-500">
          “{title}” will be permanently deleted for you and everyone it is
          shared with. This action cannot be undone.
        </p>
        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-70"
          >
            {deleting && <LoaderCircle className="animate-spin" size={16} />}
            {deleting ? "Deleting…" : "Delete document"}
          </button>
        </div>
      </section>
    </div>
  );
}

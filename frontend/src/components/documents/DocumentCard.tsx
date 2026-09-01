import { ArrowUpRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { DocumentCard as DocumentCardType } from "../../types/api.types";

export function DocumentCard({
  document,
  shared = false,
  onRequestDelete,
}: {
  document: DocumentCardType;
  shared?: boolean;
  onRequestDelete?: (document: DocumentCardType) => void;
}) {
  const date = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(document.updatedAt));

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(23,32,27,0.03)] transition duration-200 hover:-translate-y-1 hover:border-[#cbd5ca] hover:shadow-[0_18px_45px_rgba(31,56,42,0.10)]">
      <Link
        to={`/documents/${document.id}`}
        className="block text-inherit no-underline"
      >
        <div className="relative h-40 overflow-hidden border-b border-line bg-[#fafbf8] p-6">
          <div className="space-y-2 opacity-75">
            <div className="h-2.5 w-2/3 rounded-full bg-[#cbd5cc]" />
            <div className="h-1.5 w-full rounded-full bg-[#e2e7e0]" />
            <div className="h-1.5 w-5/6 rounded-full bg-[#e2e7e0]" />
            <div className="pt-2">
              <div className="h-1.5 w-full rounded-full bg-[#e8ebe6]" />
            </div>
            <div className="h-1.5 w-3/4 rounded-full bg-[#e8ebe6]" />
          </div>
          <span className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-white text-ink-500 opacity-0 shadow-sm transition group-hover:opacity-100">
            <ArrowUpRight size={16} />
          </span>
        </div>
        <div className="p-5 pr-14">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold tracking-[-0.02em]">
              {document.title}
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              {shared ? `Owned by ${document.ownerName}` : `Edited ${date}`}
            </p>
          </div>
        </div>
      </Link>
      {onRequestDelete && (
        <button
          type="button"
          onClick={() => onRequestDelete(document)}
          aria-label={`Delete ${document.title}`}
          title="Delete document"
          className="absolute bottom-4 right-4 grid size-9 place-items-center rounded-lg text-ink-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:bg-red-50 focus-visible:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          <Trash2 size={17} />
        </button>
      )}
    </article>
  );
}

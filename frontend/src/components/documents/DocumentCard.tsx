import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import type { DocumentCard as DocumentCardType } from "../../types/api.types";

export function DocumentCard({
  document,
  shared = false,
}: {
  document: DocumentCardType;
  shared?: boolean;
}) {
  const date = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(document.updatedAt));
  return (
    <Link
      to={`/documents/${document.id}`}
      className="group overflow-hidden rounded-2xl border border-line bg-white text-inherit no-underline shadow-[0_1px_2px_rgba(23,32,27,0.03)] transition duration-200 hover:-translate-y-1 hover:border-[#cbd5ca] hover:shadow-[0_18px_45px_rgba(31,56,42,0.10)]"
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
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold tracking-[-0.02em]">
              {document.title}
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              {shared ? `Owned by ${document.ownerName}` : `Edited ${date}`}
            </p>
          </div>
          <MoreHorizontal className="mt-0.5 shrink-0 text-ink-500" size={18} />
        </div>
      </div>
    </Link>
  );
}

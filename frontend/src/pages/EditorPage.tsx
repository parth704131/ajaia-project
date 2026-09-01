import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CloudOff,
  LoaderCircle,
  RefreshCw,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DocumentEditor } from "../components/editor/DocumentEditor";
import { ShareDialog } from "../components/sharing/ShareDialog";
import {
  useDocumentAutosave,
  type SaveStatus,
} from "../hooks/use-document-autosave";
import { useInitializeUsers } from "../hooks/use-initialize-users";
import { fetchDocument, renameDocument } from "../services/api/document-api";
import { useUserStore } from "../state/store";
import type { DocumentAccess, DocumentDetails } from "../types/api.types";

type LoadedDocument = {
  document: DocumentDetails;
  access: DocumentAccess;
  loadedForUserId: string;
};

export function EditorPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const currentUserId = useUserStore((state) => state.currentUserId);
  const { status: userStatus } = useInitializeUsers();
  const [data, setData] = useState<LoadedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!documentId || !currentUserId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchDocument(documentId, currentUserId, controller.signal)
      .then((result) => setData({ ...result, loadedForUserId: currentUserId }))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError")
          return;
        setError(
          reason instanceof Error ? reason.message : "Could not open document",
        );
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [currentUserId, documentId, reloadKey]);

  if (userStatus === "idle" || userStatus === "loading" || loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoaderCircle className="animate-spin text-moss-700" size={28} />
      </div>
    );
  }
  if (
    error ||
    !data ||
    !currentUserId ||
    !documentId ||
    data.loadedForUserId !== currentUserId
  ) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="max-w-md text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-700">
            <AlertTriangle size={22} />
          </span>
          <h1 className="mt-4 text-2xl font-bold">
            This document isn’t available
          </h1>
          <p className="mt-2 text-ink-500">
            {error ?? "The document may have been removed."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/"
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink-700 no-underline"
            >
              Back to docs
            </Link>
            <button
              onClick={() => setReloadKey((value) => value + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-moss-700 px-4 py-2.5 text-sm font-bold text-white"
            >
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoadedEditor
      documentId={documentId}
      userId={currentUserId}
      initialData={data}
    />
  );
}

function LoadedEditor({
  documentId,
  userId,
  initialData,
}: {
  documentId: string;
  userId: string;
  initialData: LoadedDocument;
}) {
  const users = useUserStore((state) => state.users);
  const currentUserId = useUserStore((state) => state.currentUserId);
  const selectUser = useUserStore((state) => state.selectUser);
  const [title, setTitle] = useState(initialData.document.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const autosave = useDocumentAutosave({
    documentId,
    userId,
    initialVersion: initialData.document.version,
  });
  const isOwner = initialData.access === "owner";

  async function saveTitle() {
    const normalized = title.trim();
    if (!isOwner || normalized === initialData.document.title) return;
    if (!normalized) {
      setTitle(initialData.document.title);
      return;
    }
    setTitleError(null);
    try {
      await renameDocument(documentId, userId, normalized);
      setTitle(normalized);
    } catch (reason: unknown) {
      setTitleError(
        reason instanceof Error ? reason.message : "Could not rename document",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#edf0eb]">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
          <Link
            to="/"
            aria-label="Back to documents"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-700 transition hover:bg-canvas"
          >
            <ArrowLeft size={19} />
          </Link>
          <div className="min-w-0 flex-1">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={() => void saveTitle()}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              readOnly={!isOwner}
              maxLength={120}
              aria-label="Document title"
              className="w-full truncate border-0 bg-transparent p-0 text-base font-bold tracking-[-0.02em] outline-none read-only:cursor-default"
            />
            <p className="mt-0.5 text-xs text-ink-500">
              {isOwner
                ? "Owned by you"
                : `Shared by ${initialData.document.ownerName}`}
              {titleError ? ` · ${titleError}` : ""}
            </p>
          </div>
          <SaveIndicator
            status={autosave.status}
            savedAt={autosave.savedAt}
            onRetry={autosave.retry}
          />
          <button
            onClick={() => setShareOpen(true)}
            disabled={!isOwner}
            title={
              isOwner ? "Share document" : "Only the owner can manage sharing"
            }
            className="hidden items-center gap-2 rounded-xl bg-moss-700 px-3.5 py-2.5 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-[#a7b1aa] sm:inline-flex"
          >
            <Share2 size={16} /> Share
          </button>
          <select
            value={currentUserId ?? ""}
            onChange={(event) => selectUser(event.target.value)}
            aria-label="Select demo user"
            className="max-w-32 rounded-xl border border-line bg-white px-2.5 py-2 text-sm font-semibold outline-none focus:border-moss-600"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </header>
      {autosave.status === "conflict" && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          This document changed elsewhere.{" "}
          <button
            onClick={() => window.location.reload()}
            className="font-bold underline"
          >
            Reload the latest version
          </button>
        </div>
      )}
      <DocumentEditor
        content={initialData.document.content}
        onChange={autosave.queueSave}
      />
      {shareOpen && (
        <ShareDialog
          documentId={documentId}
          ownerId={userId}
          users={users}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}

function SaveIndicator({
  status,
  savedAt,
  onRetry,
}: {
  status: SaveStatus;
  savedAt: Date | null;
  onRetry: () => void;
}) {
  if (status === "saving" || status === "unsaved")
    return (
      <span className="hidden items-center gap-1.5 text-xs font-semibold text-ink-500 md:inline-flex">
        <LoaderCircle
          className={status === "saving" ? "animate-spin" : ""}
          size={14}
        />
        {status === "saving" ? "Saving…" : "Unsaved"}
      </span>
    );
  if (status === "error")
    return (
      <button
        onClick={onRetry}
        className="hidden items-center gap-1.5 text-xs font-bold text-red-700 md:inline-flex"
      >
        <CloudOff size={14} /> Save failed · Retry
      </button>
    );
  if (status === "conflict")
    return (
      <span className="hidden items-center gap-1.5 text-xs font-bold text-amber-700 md:inline-flex">
        <AlertTriangle size={14} /> Conflict
      </span>
    );
  return (
    <span className="hidden items-center gap-1.5 text-xs font-semibold text-ink-500 md:inline-flex">
      <Check size={14} className="text-moss-600" />
      {savedAt ? "Saved just now" : "Saved"}
    </span>
  );
}

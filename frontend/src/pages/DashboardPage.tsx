import { FileUp, Plus, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeleteDocumentDialog } from "../components/documents/DeleteDocumentDialog";
import { DocumentCard } from "../components/documents/DocumentCard";
import { AppHeader } from "../components/layout/AppHeader";
import { useInitializeUsers } from "../hooks/use-initialize-users";
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  importDocument,
  type DocumentList,
} from "../services/api/document-api";
import { useUserStore } from "../state/store";
import type { DocumentCard as DocumentCardType } from "../types/api.types";

const EMPTY_LIST: DocumentList = { owned: [], shared: [] };

export function DashboardPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = useUserStore((state) => state.currentUserId);
  const {
    status: usersStatus,
    error: usersError,
    retry: retryUsers,
  } = useInitializeUsers();
  const [documents, setDocuments] = useState(EMPTY_LIST);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentCardType | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!currentUserId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchDocuments(currentUserId, controller.signal)
      .then(setDocuments)
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError")
          return;
        setError(
          reason instanceof Error ? reason.message : "Could not load documents",
        );
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [currentUserId, reloadKey]);

  async function handleCreate() {
    if (!currentUserId || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const document = await createDocument(currentUserId);
      navigate(`/documents/${document.id}`);
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : "Could not create document",
      );
      setSubmitting(false);
    }
  }

  async function handleImport(file: File) {
    if (!currentUserId || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const document = await importDocument(currentUserId, file);
      navigate(`/documents/${document.id}`);
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : "Could not import file",
      );
      setSubmitting(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!currentUserId || !documentToDelete || deleting) return;
    setDeleting(true);
    setError(null);

    try {
      await deleteDocument(documentToDelete.id, currentUserId);
      setDocuments((current) => ({
        ...current,
        owned: current.owned.filter(
          (document) => document.id !== documentToDelete.id,
        ),
      }));
      setDocumentToDelete(null);
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : "Could not delete document",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (usersStatus === "loading" || usersStatus === "idle")
    return (
      <div className="grid min-h-screen place-items-center text-ink-500">
        Preparing your workspace…
      </div>
    );
  if (usersStatus === "error")
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Couldn’t open Ajaia Docs</h1>
          <p className="mt-2 text-ink-500">{usersError}</p>
          <button
            onClick={() => void retryUsers()}
            className="mt-5 rounded-xl bg-moss-700 px-5 py-3 font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <section className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-moss-700">
              Your workspace
            </span>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-[-0.05em] sm:text-5xl">
              Ideas, decisions, and work—in one place.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-ink-500">
              Create a focused document, import a draft, or continue something
              your team shared.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImport(file);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-bold text-ink-700 shadow-sm transition hover:border-[#c7d1c7] hover:bg-[#fafbf9]"
            >
              <FileUp size={17} /> Import
            </button>
            <button
              onClick={() => void handleCreate()}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-moss-700 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(39,100,71,0.22)] transition hover:bg-moss-600"
            >
              <Plus size={17} /> New document
            </button>
          </div>
        </section>

        <p className="mt-3 text-xs text-ink-500">
          Import supports .txt and .md files up to 1 MB.
        </p>
        {error && (
          <div
            role="alert"
            className="mt-7 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <span>{error}</span>
            <button
              onClick={() => setReloadKey((value) => value + 1)}
              className="inline-flex items-center gap-1.5 font-bold"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}
        <DocumentSection
          title="Owned by you"
          subtitle="Documents you created and control"
          documents={documents.owned}
          loading={loading}
          emptyMessage="Create your first document to start writing."
          onRequestDelete={setDocumentToDelete}
        />
        <DocumentSection
          title="Shared with you"
          subtitle="Documents teammates invited you to edit"
          documents={documents.shared}
          loading={loading}
          emptyMessage="Shared documents will appear here."
        />
      </main>
      {documentToDelete && (
        <DeleteDocumentDialog
          title={documentToDelete.title}
          deleting={deleting}
          onCancel={() => setDocumentToDelete(null)}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  );
}

function DocumentSection({
  title,
  subtitle,
  documents,
  loading,
  emptyMessage,
  onRequestDelete,
}: {
  title: string;
  subtitle: string;
  documents: DocumentList["owned"];
  loading: boolean;
  emptyMessage: string;
  onRequestDelete?: (document: DocumentCardType) => void;
}) {
  return (
    <section className="mt-14">
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-[-0.03em]">{title}</h2>
        <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
      </div>
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        </div>
      ) : documents.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              shared={title.startsWith("Shared")}
              onRequestDelete={onRequestDelete}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#ccd5cc] bg-white/50 px-6 py-10 text-center text-sm text-ink-500">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}

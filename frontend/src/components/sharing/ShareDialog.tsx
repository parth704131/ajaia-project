import { LoaderCircle, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  fetchCollaborators,
  revokeShare,
  shareDocument,
} from "../../services/api/document-api";
import type { Collaborator, User } from "../../types/api.types";

export function ShareDialog({
  documentId,
  ownerId,
  users,
  onClose,
}: {
  documentId: string;
  ownerId: string;
  users: User[];
  onClose: () => void;
}) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setCollaborators(await fetchCollaborators(documentId, ownerId));
    } catch (reason: unknown) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not load collaborators",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [documentId, ownerId]);
  const eligibleUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.id !== ownerId &&
          !collaborators.some(
            (collaborator) => collaborator.userId === user.id,
          ),
      ),
    [collaborators, ownerId, users],
  );

  async function handleShare() {
    if (!selectedUserId) return;
    setSubmitting(true);
    setError(null);
    try {
      await shareDocument(documentId, ownerId, selectedUserId);
      setSelectedUserId("");
      await load();
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : "Could not share document",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevoke(userId: string) {
    setSubmitting(true);
    setError(null);
    try {
      await revokeShare(documentId, ownerId, userId);
      await load();
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : "Could not revoke access",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-950/35 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/50 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2
              id="share-title"
              className="text-xl font-bold tracking-[-0.03em]"
            >
              Share document
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Collaborators can open and edit the content.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-canvas"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 flex gap-2">
          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-moss-600"
          >
            <option value="">Choose a user</option>
            {eligibleUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => void handleShare()}
            disabled={!selectedUserId || submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-moss-700 px-4 text-sm font-bold text-white disabled:opacity-50"
          >
            <UserPlus size={16} /> Add
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
            People with access
          </h3>
          {loading ? (
            <LoaderCircle className="mx-auto mt-6 animate-spin text-moss-700" />
          ) : collaborators.length ? (
            <div className="mt-3 space-y-2">
              {collaborators.map((person) => (
                <div
                  key={person.userId}
                  className="flex items-center justify-between gap-3 rounded-xl bg-canvas px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{person.name}</p>
                    <p className="truncate text-xs text-ink-500">
                      {person.email} · Editor
                    </p>
                  </div>
                  <button
                    onClick={() => void handleRevoke(person.userId)}
                    disabled={submitting}
                    className="text-xs font-bold text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-500">
              Only you have access right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

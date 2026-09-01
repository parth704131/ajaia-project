import type { JSONContent } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../services/api/client";
import { saveDocument } from "../services/api/document-api";

export type SaveStatus = "saved" | "unsaved" | "saving" | "error" | "conflict";

type AutosaveOptions = {
  documentId: string;
  userId: string;
  initialVersion: number;
};

export function useDocumentAutosave({
  documentId,
  userId,
  initialVersion,
}: AutosaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const versionRef = useRef(initialVersion);
  const pendingContentRef = useRef<JSONContent | null>(null);
  const inFlightRef = useRef(false);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const performSave = useCallback(async () => {
    if (inFlightRef.current || !pendingContentRef.current) return;
    const content = pendingContentRef.current;
    pendingContentRef.current = null;
    inFlightRef.current = true;
    setStatus("saving");

    try {
      const result = await saveDocument(
        documentId,
        userId,
        content,
        versionRef.current,
      );
      versionRef.current = result.version;
      if (mountedRef.current) {
        setSavedAt(new Date(result.updatedAt));
        setStatus(pendingContentRef.current ? "unsaved" : "saved");
      }
    } catch (error: unknown) {
      pendingContentRef.current ??= content;
      pausedRef.current = true;
      if (mountedRef.current) {
        setStatus(
          error instanceof ApiError && error.status === 409
            ? "conflict"
            : "error",
        );
      }
    } finally {
      inFlightRef.current = false;
      if (
        pendingContentRef.current &&
        mountedRef.current &&
        !pausedRef.current
      ) {
        timerRef.current = setTimeout(() => void performSave(), 100);
      } else if (
        pendingContentRef.current &&
        !mountedRef.current &&
        !pausedRef.current
      ) {
        const latestContent = pendingContentRef.current;
        pendingContentRef.current = null;
        void saveDocument(
          documentId,
          userId,
          latestContent,
          versionRef.current,
          true,
        );
      }
    }
  }, [documentId, userId]);

  const queueSave = useCallback(
    (content: JSONContent) => {
      pendingContentRef.current = content;
      if (pausedRef.current) return;
      setStatus("unsaved");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void performSave(), 800);
    },
    [performSave],
  );

  const retry = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    pausedRef.current = false;
    void performSave();
  }, [performSave]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pendingContentRef.current && !inFlightRef.current) {
        void saveDocument(
          documentId,
          userId,
          pendingContentRef.current,
          versionRef.current,
          true,
        );
      }
    };
  }, [documentId, userId]);

  return { status, savedAt, queueSave, retry };
}

import { useState, useRef, useCallback, useEffect } from "react";
import { uploadPDF, pollStatus, sendMessage, fetchHistory } from "./api";

export type Message = { id: number; role: "user" | "ai"; text: string };
export type Toast = { id: number; message: string; type: "error" | "success" };

let msgId = 0;

export function useChat() {
  const [docId, setDocId] = useState<string | null>(() => localStorage.getItem("docId"));
  const [fileName, setFileName] = useState<string | null>(() => localStorage.getItem("fileName"));
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Restore chat history on mount if docId exists
  useEffect(() => {
    if (!docId) return;
    fetchHistory(docId).then((history) => {
      if (history.length > 0) {
        setMessages(history.map((h) => ({ id: ++msgId, role: h.role as "user" | "ai", text: h.text })));
      }
    }).catch(() => {});
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "error") => {
      const id = Date.now();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    },
    [],
  );

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".pdf")) {
        addToast("Only PDF files are supported");
        return;
      }
      setUploading(true);
      setUploadProgress("Uploading...");
      try {
        const id = await uploadPDF(file);
        setUploadProgress("Processing PDF...");
        let status = "processing";
        while (status === "processing") {
          await new Promise((r) => setTimeout(r, 2000));
          status = await pollStatus(id);
        }
        if (status.startsWith("error")) throw new Error(status.replace("error:", ""));
        setDocId(id);
        setFileName(file.name);
        setMessages([]);
        localStorage.setItem("docId", id);
        localStorage.setItem("fileName", file.name);
        addToast(`"${file.name}" ready to chat!`, "success");
      } catch (err: any) {
        addToast(err.message);
      } finally {
        setUploading(false);
        setUploadProgress("");
      }
    },
    [addToast],
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || !docId || loading) return;
      const question = text.trim();
      setMessages((m) => [...m, { id: ++msgId, role: "user", text: question }]);
      setLoading(true);
      try {
        const answer = await sendMessage(docId, question);
        setMessages((m) => [...m, { id: ++msgId, role: "ai", text: answer }]);
      } catch (err: any) {
        setMessages((m) => [
          ...m,
          { id: ++msgId, role: "ai", text: `⚠️ ${err.message}` },
        ]);
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [docId, loading],
  );

  const handleNewChat = useCallback(() => {
    localStorage.removeItem("docId");
    localStorage.removeItem("fileName");
    setDocId(null);
    setFileName(null);
    setMessages([]);
  }, []);

  return {
    docId,
    fileName,
    uploading,
    uploadProgress,
    messages,
    loading,
    toasts,
    inputRef,
    handleUpload,
    handleSend,
    handleNewChat,
  };
}

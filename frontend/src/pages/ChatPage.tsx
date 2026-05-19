import { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStep =
  | "memory_agent"
  | "tool_agent"
  | "retrieval_agent"
  | "research_agent"
  | "verification_agent";

interface Chunk {
  text: string;
  score?: number;
}

interface Verification {
  verified: boolean;
  confidence?: number;
  reason?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  retrieved_chunks?: Chunk[];
  verification?: Verification;
  tool_result?: string;
  agentTrace?: AgentStep[];
  isLoading?: boolean;
}

interface UploadedDoc {
  name: string;
  chunks: number;
  uploadedAt: Date;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AGENT_STEPS: { key: AgentStep; label: string; icon: string; desc: string }[] = [
  { key: "memory_agent",       label: "Memory",    icon: "💾", desc: "Loading session context" },
  { key: "tool_agent",         label: "Tool",      icon: "🔧", desc: "Checking tool augmentations" },
  { key: "retrieval_agent",    label: "Retrieval", icon: "📡", desc: "Searching document corpus" },
  { key: "research_agent",     label: "Research",  icon: "🔬", desc: "Synthesizing an answer" },
  { key: "verification_agent", label: "Verify",    icon: "✅", desc: "Verifying accuracy" },
];

const SUGGESTED_QUERIES = [
  "Summarize the key findings in the uploaded documents",
  "What are the main recommendations from the report?",
  "List all quantitative data points found",
  "Compare methodologies across the uploaded PDFs",
];

// const API_BASE = "http://localhost:8000";
const API_BASE = "http://34.123.45.67:8000";
const STORAGE_KEY = "astraeus_guest_name";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const initials = (name: string) =>
  name.trim().split(" ").map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");

async function simulateAgentTrace(onStep: (s: AgentStep) => void) {
  const steps: AgentStep[] = [
    "memory_agent", "tool_agent", "retrieval_agent", "research_agent", "verification_agent",
  ];
  for (const s of steps) {
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
    onStep(s);
  }
}

// ─── Guest Name Modal ─────────────────────────────────────────────────────────

function GuestModal({ onConfirm }: { onConfirm: (name: string) => void }) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = (asGuest = false) => {
    const n = asGuest ? "Guest" : name.trim() || "Guest";
    localStorage.setItem(STORAGE_KEY, n);
    onConfirm(n);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,41,112,0.12)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "#fff", border: "1.5px solid #e2e8f0" }}
      >
        <div
          className="px-8 pt-8 pb-7"
          style={{ background: "linear-gradient(135deg,#002970 0%,#00BAF2 100%)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
            style={{ background: "rgba(255,255,255,0.18)" }}
          >
            🧠
          </div>
          <h2 className="text-xl font-black text-white">Welcome to Astraeus</h2>
          <p className="text-blue-100 text-sm mt-1 leading-relaxed">
            No account needed. Just enter a name so we can personalise your session.
          </p>
        </div>

        <div className="px-8 py-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#002970] mb-2">
              Your display name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="e.g. Priya, Rohan, Team Alpha…"
              maxLength={32}
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold outline-none transition-all"
              style={{ border: "1.5px solid #e2e8f0", color: "#002970", background: "#f8fafc" }}
              onFocus={(e) => (e.target.style.borderColor = "#00BAF2")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Saved locally on this device — no signup, no password.
            </p>
          </div>

          <button
            onClick={() => submit()}
            className="w-full py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: "linear-gradient(90deg,#002970,#00BAF2)" }}
          >
            Start Chatting →
          </button>

          <button
            onClick={() => submit(true)}
            className="w-full py-2 rounded-xl font-semibold text-slate-400 text-xs hover:text-slate-600 transition-colors"
          >
            Continue as Guest
          </button>

          <div
            className="rounded-xl p-3 text-xs text-slate-500 leading-relaxed"
            style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}
          >
            💡 Different names = different isolated sessions. Share this app with teammates — each person gets their own independent conversation history.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Agent Pipeline ───────────────────────────────────────────────────────────

function AgentPipeline({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {AGENT_STEPS.map((a, i) => {
        const done = steps.includes(a.key);
        const active =
          !done &&
          (i === 0 ? steps.length === 0 : steps.includes(AGENT_STEPS[i - 1].key));
        return (
          <div key={a.key} className="flex items-center gap-1">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-all duration-500"
              style={{
                background: done ? "#dbeafe" : active ? "#eff6ff" : "#f8fafc",
                color: done ? "#002970" : active ? "#00BAF2" : "#94a3b8",
                border: `1px solid ${done ? "#93c5fd" : active ? "#bae6fd" : "#e2e8f0"}`,
              }}
            >
              <span className={active ? "animate-spin inline-block" : ""} style={{ animationDuration: "1s" }}>
                {done ? "✓" : a.icon}
              </span>
              {a.label}
            </div>
            {i < AGENT_STEPS.length - 1 && (
              <span className="text-xs" style={{ color: done ? "#93c5fd" : "#e2e8f0" }}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Chunk Card ───────────────────────────────────────────────────────────────

function ChunkCard({ chunk, index }: { chunk: Chunk; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const text = chunk.text || String(chunk);
  const preview = text.length > 160 ? text.slice(0, 160) + "…" : text;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="rounded-xl border p-3 cursor-pointer transition-all hover:shadow-sm"
      style={{ background: "#eff6ff", borderColor: "#bae6fd" }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-black text-[#002970]">Source #{index + 1}</span>
        <div className="flex items-center gap-2">
          {chunk.score !== undefined && (
            <span className="text-xs text-[#00BAF2] font-mono font-bold">
              {(chunk.score * 100).toFixed(0)}% match
            </span>
          )}
          <span className="text-xs text-slate-400">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{expanded ? text : preview}</p>
    </div>
  );
}

// ─── Verification Badge ───────────────────────────────────────────────────────

function VerificationBadge({ v }: { v: Verification }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style={{
        background: v.verified ? "#dcfce7" : "#fee2e2",
        color: v.verified ? "#15803d" : "#dc2626",
        border: `1px solid ${v.verified ? "#86efac" : "#fca5a5"}`,
      }}
    >
      {v.verified ? "✓ Verified" : "✗ Unverified"}
      {v.confidence !== undefined && (
        <span className="opacity-60">· {Math.round(v.confidence * 100)}%</span>
      )}
    </span>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, userName }: { msg: Message; userName: string }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm"
        style={
          isUser
            ? { background: "linear-gradient(135deg,#002970,#004ab3)", color: "#fff" }
            : { background: "#fff", color: "#002970", border: "1.5px solid #bae6fd" }
        }
      >
        {isUser ? initials(userName) || "U" : "A"}
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[76%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs font-bold text-slate-400">{isUser ? userName : "Astraeus"}</span>
          <span className="text-xs text-slate-300">{fmt(msg.timestamp)}</span>
        </div>

        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm"
          style={
            isUser
              ? { background: "linear-gradient(135deg,#002970,#004ab3)", color: "#fff", borderBottomRightRadius: 4 }
              : { background: "#fff", color: "#1e293b", border: "1.5px solid #e2e8f0", borderBottomLeftRadius: 4 }
          }
        >
          {msg.isLoading && !msg.content ? (
            <span className="flex items-center gap-2 text-slate-400 text-xs">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#00BAF2] animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </span>
              Thinking…
            </span>
          ) : (
            <>
              {msg.content}
              {/* Blinking cursor while streaming */}
              {msg.isLoading && msg.content && (
                <span className="animate-pulse text-[#00BAF2] ml-0.5">▌</span>
              )}
            </>
          )}
        </div>

        {!isUser && msg.agentTrace && msg.agentTrace.length > 0 && (
          <AgentPipeline steps={msg.agentTrace} />
        )}

        {!isUser && !msg.isLoading && (
          <div className="flex items-center gap-2 flex-wrap">
            {msg.verification && <VerificationBadge v={msg.verification} />}

            {msg.retrieved_chunks && msg.retrieved_chunks.length > 0 && (
              <button
                onClick={() => setShowSources(!showSources)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: showSources ? "#dbeafe" : "#f8fafc",
                  color: showSources ? "#002970" : "#64748b",
                  border: `1px solid ${showSources ? "#93c5fd" : "#e2e8f0"}`,
                }}
              >
                📚 {msg.retrieved_chunks.length} source{msg.retrieved_chunks.length !== 1 ? "s" : ""}
              </button>
            )}

            {msg.tool_result && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "#fefce8", color: "#92400e", border: "1px solid #fde68a" }}
              >
                🔧 Tool used
              </span>
            )}
          </div>
        )}

        {showSources && msg.retrieved_chunks && msg.retrieved_chunks.length > 0 && (
          <div className="w-full flex flex-col gap-2 mt-1">
            {msg.retrieved_chunks.map((c, i) => (
              <ChunkCard key={i} chunk={c} index={i} />
            ))}
          </div>
        )}

        {showSources && msg.tool_result && (
          <div
            className="w-full p-3 rounded-xl text-xs font-mono leading-relaxed mt-1"
            style={{ background: "#fefce8", color: "#78350f", border: "1px solid #fde68a" }}
          >
            <div className="font-black text-amber-700 mb-1.5">🔧 Tool Result</div>
            {msg.tool_result}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  docs, sessionId, userName, onUpload, onNewChat, open, onClose,
}: {
  docs: UploadedDoc[];
  sessionId: string;
  userName: string;
  onUpload: (f: File) => void;
  onNewChat: () => void;
  open: boolean;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/10 md:hidden" onClick={onClose} />
      )}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300 overflow-hidden border-r z-30 relative"
        style={{ width: open ? 264 : 0, background: "#fff", borderColor: "#e2e8f0" }}
      >
        <div className="flex flex-col h-full min-w-[264px]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs"
                style={{ background: "linear-gradient(135deg,#002970,#00BAF2)" }}
              >
                A
              </div>
              <span className="font-black text-[#002970] text-base tracking-tight">ASTRAEUS</span>
            </div>
            <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors text-sm font-bold">✕</button>
          </div>

          <div className="px-4 py-3 flex flex-col gap-2">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
              style={{ background: "linear-gradient(90deg,#002970,#00BAF2)" }}
            >
              <span>+</span> New Conversation
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-[#002970] border border-[#e2e8f0] hover:bg-blue-50 transition-all"
            >
              📄 Upload PDF
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-300 mb-2">
              Documents ({docs.length})
            </p>
            {docs.length === 0 ? (
              <div className="rounded-xl p-4 text-center border border-dashed" style={{ borderColor: "#e2e8f0" }}>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No documents yet.<br />Upload a PDF to start Q&A.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {docs.map((d, i) => (
                  <div key={i} className="px-3 py-2.5 rounded-xl border border-[#e2e8f0] hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer">
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">📄</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#002970] truncate">{d.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{d.chunks} chunks · {fmt(d.uploadedAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-[#f1f5f9]">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-xs shrink-0"
                style={{ background: "linear-gradient(135deg,#002970,#00BAF2)" }}
              >
                {initials(userName) || "G"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-[#002970] truncate">{userName}</p>
                <p className="text-xs text-slate-400 font-mono truncate">{sessionId}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Main Chat Page ───────────────────────────────────────────────────────────

export default function ChatPage() {
  const [userName, setUserName] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY)
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [sessionId] = useState(`session_${uid()}`);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 160) + "px";
  }, [input]);

  const handleUpload = useCallback(async (file: File) => {
    setUploadStatus("Uploading…");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDocs((d) => [
        ...d,
        { name: file.name, chunks: data.chunks_stored, uploadedAt: new Date() },
      ]);
      setUploadStatus(`✓ "${file.name}" — ${data.chunks_stored} chunks stored`);
    } catch {
      setUploadStatus("✗ Upload failed — is the backend running?");
    }
    setTimeout(() => setUploadStatus(null), 4000);
  }, []);

  // ── Streaming send ──────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (text?: string) => {
      const q = (text ?? input).trim();
      if (!q || loading) return;
      setInput("");

      // Cancel any in-flight stream
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      const userMsg: Message = {
        id: uid(), role: "user", content: q, timestamp: new Date(),
      };
      const placeholderId = uid();
      const placeholder: Message = {
        id: placeholderId, role: "assistant", content: "",
        timestamp: new Date(), isLoading: true, agentTrace: [],
      };

      setMessages((m) => [...m, userMsg, placeholder]);
      setLoading(true);

      // Visual agent trace runs in parallel — purely cosmetic
      simulateAgentTrace((step) => {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === placeholderId
              ? { ...msg, agentTrace: [...(msg.agentTrace ?? []), step] }
              : msg
          )
        );
      });

      try {
        const res = await fetch(
          `${API_BASE}/stream-query?question=${encodeURIComponent(q)}&session_id=${encodeURIComponent(sessionId)}`,
          { method: "POST", signal: abort.signal }
        );

        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const reader   = res.body.getReader();
        const decoder  = new TextDecoder("utf-8");

        // ── Micro-batch flush ──────────────────────────────────────────────
        // We accumulate tokens in a ref between animation frames so React
        // never skips a re-render yet also never triggers hundreds of
        // synchronous setState calls per second.
        let pendingText = "";
        let rafId: number | null = null;

        const flush = () => {
          rafId = null;
          if (!pendingText) return;
          const chunk = pendingText;
          pendingText = "";
          setMessages((m) =>
            m.map((msg) =>
              msg.id === placeholderId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        };

        const appendToken = (token: string) => {
          pendingText += token;
          // Schedule one flush per animation frame (~16 ms) — smooth and cheap
          if (rafId === null) {
            rafId = requestAnimationFrame(flush);
          }
        };

        // ── Read loop ──────────────────────────────────────────────────────
        // Backend sends plain UTF-8 text via FastAPI StreamingResponse.
        // Each read() call may deliver one or more tokens; we decode
        // incrementally so multi-byte characters are never split.
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // stream:true keeps the decoder's internal state between calls
          // so a UTF-8 sequence split across two chunks is handled correctly.
          const text = decoder.decode(value, { stream: true });
          if (text) appendToken(text);
        }

        // Flush the decoder's internal buffer (stream:false finalizes state)
        const tail = decoder.decode();
        if (tail) appendToken(tail);

        // Cancel any pending raf and do a final synchronous flush
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        flush();

        // Mark complete
        setMessages((m) =>
          m.map((msg) =>
            msg.id === placeholderId
              ? {
                  ...msg,
                  isLoading: false,
                  agentTrace: AGENT_STEPS.map((a) => a.key),
                }
              : msg
          )
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setMessages((m) =>
          m.map((msg) =>
            msg.id === placeholderId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    "Couldn't reach the backend. Make sure Astraeus is running on localhost:8000.",
                  isLoading: false,
                  verification: { verified: false, confidence: 0 },
                  retrieved_chunks: [],
                  agentTrace: AGENT_STEPS.map((a) => a.key),
                }
              : msg
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [input, loading, sessionId]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setLoading(false);
  };

  if (!userName) {
    return <GuestModal onConfirm={(n) => setUserName(n)} />;
  }

  const isEmpty = messages.length === 0;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f1f5f9", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
    >
      <Sidebar
        docs={docs}
        sessionId={sessionId}
        userName={userName}
        onUpload={handleUpload}
        onNewChat={clearChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 bg-white">

        {/* Topbar */}
        <header
          className="flex items-center gap-3 px-5 py-3 border-b shrink-0 bg-white"
          style={{ borderColor: "#e2e8f0" }}
        >
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-[#002970] transition-colors mr-1 text-lg"
            >
              ☰
            </button>
          )}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs shrink-0"
            style={{ background: "linear-gradient(135deg,#002970,#00BAF2)" }}
          >
            A
          </div>
          <div>
            <p className="font-black text-[#002970] text-sm tracking-tight leading-none">ASTRAEUS</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {docs.length} doc{docs.length !== 1 ? "s" : ""} loaded · {userName}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {uploadStatus && (
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: uploadStatus.startsWith("✓") ? "#dcfce7" : uploadStatus.startsWith("✗") ? "#fee2e2" : "#dbeafe",
                  color: uploadStatus.startsWith("✓") ? "#15803d" : uploadStatus.startsWith("✗") ? "#dc2626" : "#002970",
                }}
              >
                {uploadStatus}
              </span>
            )}
            <button
              onClick={clearChat}
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-[#002970] border border-[#e2e8f0] hover:bg-blue-50 transition-all"
            >
              + New Chat
            </button>
            <button
              onClick={() => { localStorage.removeItem(STORAGE_KEY); setUserName(null); }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 border border-[#e2e8f0] hover:bg-slate-50 transition-all"
              title="Switch user"
            >
              Switch User
            </button>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-12 gap-8">
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-md"
                  style={{ background: "linear-gradient(135deg,#002970,#00BAF2)" }}
                >
                  🧠
                </div>
                <h2 className="text-2xl font-black text-[#002970] mb-2">
                  Hello, {userName.split(" ")[0]}!
                </h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  Upload PDFs using the sidebar, then ask anything — six specialised agents will research, retrieve, and verify your answer.
                </p>
              </div>

              <div className="w-full max-w-lg bg-white rounded-2xl border border-[#e2e8f0] shadow-sm px-5 py-4">
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-3">Agent Pipeline</p>
                <AgentPipeline steps={[]} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTED_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left px-4 py-3 rounded-xl text-sm font-medium bg-white border border-[#e2e8f0] hover:border-[#00BAF2] hover:shadow-sm transition-all text-slate-500"
                  >
                    <span className="font-black text-[#00BAF2] mr-1.5">→</span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} userName={userName} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-[#e2e8f0] bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div
              className="flex items-end gap-3 px-4 py-3 rounded-2xl border bg-white transition-all focus-within:border-[#00BAF2] focus-within:shadow-sm"
              style={{ borderColor: "#e2e8f0" }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your documents… (Enter to send)"
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed text-slate-700 placeholder-slate-300"
                style={{ maxHeight: 160 }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
                style={{
                  background: input.trim() && !loading ? "linear-gradient(135deg,#002970,#00BAF2)" : "#f1f5f9",
                  color: input.trim() && !loading ? "#fff" : "#94a3b8",
                }}
              >
                {loading ? (
                  <span
                    className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: "#e2e8f0", borderTopColor: "#002970" }}
                  />
                ) : (
                  "↑"
                )}
              </button>
            </div>
            <p className="text-center text-xs text-slate-300 mt-2">
              Shift+Enter for newline · Answers verified by the Astraeus agent pipeline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
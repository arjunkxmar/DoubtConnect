"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Loader2, User, RotateCcw, BookOpen,
  Code2, FlaskConical, Calculator, Cpu, ChevronDown,
  Users, MessageSquare, FileQuestion, ChevronRight, X, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

// Subject quick-select options
const SUBJECTS = [
  { label: "Mathematics", icon: Calculator },
  { label: "Programming", icon: Code2 },
  { label: "Physics", icon: FlaskConical },
  { label: "Electronics", icon: Cpu },
  { label: "Data Structures", icon: BookOpen },
];

// Suggested starter questions
const STARTERS = [
  "Explain Big O notation with examples",
  "What is the difference between TCP and UDP?",
  "Explain DBMS normalization (1NF, 2NF, 3NF)",
  "How does a PN junction diode work?",
  "Explain recursion with a simple example",
  "What is integration by parts?",
];

type MessageRole = "user" | "ai";

interface Message {
  id: string;
  role: MessageRole;
  text: string;
  error?: boolean;
}

interface HistoryEntry {
  role: "user" | "model";
  text: string;
}

interface SeniorMatch {
  id: string;
  name: string;
  academicYear: string;
  branch: string;
  skills: string;
  points: number;
  score: number;
}

// ─── Senior Panel Component ─────────────────────────────────────────────────

function SeniorMatchPanel({
  matches,
  loading,
  onPost,
  onMessage,
  onDismiss,
  subject,
  topic,
  question,
}: {
  matches: SeniorMatch[];
  loading: boolean;
  onPost: (senior?: SeniorMatch) => void;
  onMessage: (senior: SeniorMatch) => void;
  onDismiss: () => void;
  subject: string;
  topic: string;
  question: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="mx-auto max-w-3xl px-4 mb-4"
    >
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/20 to-indigo-900/10 backdrop-blur-sm overflow-hidden">
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600/30 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-violet-300" />
            </div>
            <p className="text-sm font-medium text-white">
              {loading
                ? "Finding seniors who can help…"
                : matches.length > 0
                ? `${matches.length} student${matches.length > 1 ? "s" : ""} may be able to help you`
                : "Still confused? Post your doubt to the community"}
            </p>
          </div>
          <button onClick={onDismiss} className="text-[#71717A] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="px-4 py-6 flex items-center justify-center gap-2 text-[#71717A]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Matching with smart senior algorithm…</span>
          </div>
        )}

        {/* Matches */}
        {!loading && matches.length > 0 && (
          <div className="divide-y divide-white/5">
            {matches.map(senior => (
              <div key={senior.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 border border-white/10 shrink-0">
                    <AvatarFallback className="bg-[#111111] text-white text-xs">
                      {senior.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-sm font-medium truncate">{senior.name}</p>
                      <Badge className="bg-violet-600/20 text-violet-300 border-violet-500/20 text-[10px] px-1.5 py-0 h-4 shrink-0">
                        {senior.score}% match
                      </Badge>
                    </div>
                    <p className="text-xs text-[#71717A] truncate">
                      {senior.academicYear} · {senior.branch}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  <Button
                    onClick={() => onMessage(senior)}
                    variant="outline"
                    size="sm"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-7 px-2 text-xs gap-1"
                  >
                    <MessageSquare className="w-3 h-3" /> Message
                  </Button>
                  <Button
                    onClick={() => onPost(senior)}
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700 text-white h-7 px-2 text-xs gap-1"
                  >
                    <FileQuestion className="w-3 h-3" /> Post Doubt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No matches — fallback */}
        {!loading && matches.length === 0 && (
          <div className="px-4 py-3 text-[#71717A] text-sm">
            No specific seniors matched for this topic, but you can still post to the community.
          </div>
        )}

        {/* Footer CTA */}
        <div className="px-4 py-3 border-t border-white/5 flex items-center gap-2">
          <Button
            onClick={() => onPost()}
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 h-8 text-xs gap-1.5"
          >
            <FileQuestion className="w-3.5 h-3.5" />
            Post to DoubtConnect Community
            <ChevronRight className="w-3 h-3 ml-auto" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AiAssistantPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showSubjects, setShowSubjects] = useState(false);

  // Senior matching state
  const [showSeniorPanel, setShowSeniorPanel] = useState(false);
  const [seniorMatches, setSeniorMatches] = useState<SeniorMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // Track last AI conversation context for passing to doubt/matching
  const lastUserQuestion = useRef("");
  const lastAiAnswer = useRef("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showSeniorPanel]);

  const buildHistory = (): HistoryEntry[] => {
    const entries: HistoryEntry[] = [];
    for (const msg of messages) {
      if (!msg.error) {
        entries.push({ role: msg.role === "user" ? "user" : "model", text: msg.text });
      }
    }
    return entries;
  };

  // Derive tags from the question text
  const extractTags = (text: string): string[] => {
    const stopwords = new Set(["what","is","the","a","an","how","does","explain","with","me","why","when","where","can"]);
    return text.toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopwords.has(w))
      .slice(0, 5);
  };

  const sendMessage = async (question?: string) => {
    const q = (question ?? input).trim();
    if (!q || loading) return;

    lastUserQuestion.current = q;
    setShowSeniorPanel(false); // hide panel on new message

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          subject: selectedSubject,
          history: buildHistory(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString() + "_err",
            role: "ai",
            text: data.error || "Something went wrong. Please try again.",
            error: true,
          },
        ]);
      } else {
        lastAiAnswer.current = data.answer;
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString() + "_ai", role: "ai", text: data.answer },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + "_err",
          role: "ai",
          text: "Network error. Please check your connection and try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Called when student clicks "Still confused? Ask a Senior"
  const handleAskSenior = async () => {
    setShowSeniorPanel(true);
    setMatchesLoading(true);
    setSeniorMatches([]);

    const question = lastUserQuestion.current;
    const subject = selectedSubject ?? "";
    const tags = extractTags(question);

    try {
      const res = await fetch("/api/ai/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic: tags[0] ?? "", tags }),
      });
      if (res.ok) {
        const data = await res.json();
        setSeniorMatches(data.matches ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMatchesLoading(false);
    }
  };

  // Navigate to post a doubt pre-filled with AI context
  const handlePostDoubt = (senior?: SeniorMatch) => {
    const question = lastUserQuestion.current;
    const subject = selectedSubject ?? "";
    const tags = extractTags(question).join(", ");
    const params = new URLSearchParams({
      prefill: "1",
      title: question.slice(0, 100),
      description: `${question}\n\n---\n*Context from AI Assistant:*\n${lastAiAnswer.current.slice(0, 300)}`,
      subject,
      tags,
    });
    router.push(`/ask-doubt?${params.toString()}`);
  };

  // Open a message conversation with a senior
  const handleMessage = async (senior: SeniorMatch) => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: senior.id }),
      });
      if (res.ok) {
        const conv = await res.json();
        router.push(`/messages/${conv.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
    setSelectedSubject(null);
    setShowSeniorPanel(false);
    setSeniorMatches([]);
    lastUserQuestion.current = "";
    lastAiAnswer.current = "";
  };

  const isEmpty = messages.length === 0;
  const hasAiResponse = messages.some(m => m.role === "ai" && !m.error);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] bg-[#070707]">

      {/* ── Header ── */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-[#070707]/90 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-semibold text-base sm:text-lg leading-none truncate">DoubtConnect AI</h1>
            <p className="text-xs text-[#71717A] mt-0.5 hidden sm:block">Academic Assistant · Powered by Gemini</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subject selector */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubjects(v => !v)}
              className="bg-[#111111] border-white/10 text-[#A1A1AA] hover:text-white hover:bg-white/10 h-8 text-xs gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {selectedSubject ?? "Subject"}
              <ChevronDown className={`w-3 h-3 transition-transform ${showSubjects ? "rotate-180" : ""}`} />
            </Button>
            <AnimatePresence>
              {showSubjects && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-10 z-50 bg-[#111111] border border-white/10 rounded-xl p-1.5 w-44 shadow-2xl"
                >
                  <button
                    onClick={() => { setSelectedSubject(null); setShowSubjects(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg"
                  >
                    All Subjects
                  </button>
                  {SUBJECTS.map(({ label }) => (
                    <button
                      key={label}
                      onClick={() => { setSelectedSubject(label); setShowSubjects(false); }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${selectedSubject === label ? "bg-violet-600/20 text-violet-300" : "text-[#A1A1AA] hover:text-white hover:bg-white/5"}`}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-[#71717A] hover:text-white hover:bg-white/10 h-8 text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New chat
            </Button>
          )}
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isEmpty ? (
          // Welcome / empty state
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-violet-500/20"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-white mb-2"
            >
              Hi {session?.user?.name?.split(" ")[0] ?? "there"}, ask me anything!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[#71717A] text-sm max-w-md mb-8"
            >
              I explain concepts step-by-step, help with code, and generate practice questions — all to support your peer learning journey.
            </motion.p>

            {/* Quick subject buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2 justify-center mb-8"
            >
              {SUBJECTS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setSelectedSubject(prev => prev === label ? null : label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${selectedSubject === label
                    ? "border-violet-500/60 bg-violet-600/20 text-violet-300"
                    : "border-white/10 bg-white/5 text-[#A1A1AA] hover:border-white/20 hover:text-white"
                    }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </motion.div>

            {/* Starter questions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl w-full"
            >
              {STARTERS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left px-4 py-3 rounded-xl border border-white/8 bg-white/3 text-[#A1A1AA] text-sm hover:border-violet-500/40 hover:bg-violet-600/10 hover:text-white transition-all"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          // Chat messages
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div key={msg.id}>
                  <div className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-1 ${msg.role === "user"
                      ? "bg-white/10 text-white"
                      : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
                      }`}>
                      {msg.role === "user"
                        ? <User className="w-4 h-4" />
                        : <Sparkles className="w-4 h-4" />
                      }
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                      ? "bg-violet-600 text-white rounded-tr-sm"
                      : msg.error
                        ? "bg-red-900/30 border border-red-500/30 text-red-300 rounded-tl-sm"
                        : "bg-[#111111] border border-white/8 text-[#E4E4E7] rounded-tl-sm"
                      }`}>
                      {msg.role === "ai" && !msg.error ? (
                        <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-[#070707] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg prose-code:text-violet-300 prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-strong:text-white">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <span>{msg.text}</span>
                      )}
                    </div>
                  </div>

                  {/* "Still confused?" CTA after last AI message */}
                  {msg.role === "ai" && !msg.error && idx === messages.length - 1 && !loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-start ml-11 mt-3"
                    >
                      <button
                        onClick={handleAskSenior}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-violet-500/30 bg-violet-600/10 text-violet-300 text-xs hover:border-violet-500/60 hover:bg-violet-600/20 transition-all group"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Still confused? Ask a Senior
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading bubble */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#111111] border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  <span className="text-[#71717A] text-sm">Thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Senior Match Panel (above input) ── */}
      <AnimatePresence>
        {showSeniorPanel && (
          <SeniorMatchPanel
            matches={seniorMatches}
            loading={matchesLoading}
            onPost={handlePostDoubt}
            onMessage={handleMessage}
            onDismiss={() => setShowSeniorPanel(false)}
            subject={selectedSubject ?? ""}
            topic={extractTags(lastUserQuestion.current)[0] ?? ""}
            question={lastUserQuestion.current}
          />
        )}
      </AnimatePresence>

      {/* ── Input Area ── */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 sm:pt-3 border-t border-white/8 bg-[#070707] shrink-0">
        <div className="max-w-3xl mx-auto">
          {selectedSubject && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-violet-400 bg-violet-600/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                {selectedSubject}
              </span>
              <button onClick={() => setSelectedSubject(null)} className="text-[#71717A] text-xs hover:text-white">✕ Clear</button>
            </div>
          )}
          <div className="flex gap-2 items-end bg-[#111111] border border-white/10 rounded-2xl p-2 focus-within:border-violet-500/50 transition-colors">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your academic doubt... (Shift+Enter for new line)"
              disabled={loading}
              rows={1}
              className="flex-1 bg-transparent border-none text-white focus-visible:ring-0 px-2 placeholder:text-[#4B4B52] resize-none max-h-40 text-sm"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              size="icon"
              className="bg-violet-600 hover:bg-violet-700 disabled:bg-white/5 disabled:text-[#4B4B52] text-white h-9 w-9 rounded-xl shrink-0 transition-all"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </Button>
          </div>
          <p className="text-[10px] text-[#4B4B52] text-center mt-2">
            DoubtConnect AI can make mistakes. Verify with your seniors and textbooks.
          </p>
        </div>
      </div>
    </div>
  );
}

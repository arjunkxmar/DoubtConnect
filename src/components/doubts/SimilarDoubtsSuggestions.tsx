"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, ExternalLink, CheckCircle2, Clock, 
  MessageSquare, ChevronRight, X, ArrowRight, ThumbsUp 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SimilarDoubtItem {
  id: string;
  title: string;
  subject: string;
  topic: string;
  isResolved: boolean;
  answersCount: number;
  votesCount: number;
  score: number;
}

interface SimilarDoubtsSuggestionsProps {
  suggestions: SimilarDoubtItem[];
  isLoading?: boolean;
  onDismiss: () => void;
}

export function SimilarDoubtsSuggestions({
  suggestions,
  isLoading = false,
  onDismiss,
}: SimilarDoubtsSuggestionsProps) {
  if (!isLoading && suggestions.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-[#161224] via-[#111111] to-[#0c0c0c] p-5 shadow-2xl shadow-purple-900/10 mb-6 relative overflow-hidden"
      >
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Similar questions you may find useful
                <span className="text-[11px] font-normal text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {suggestions.length} found
                </span>
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                A peer or mentor may have already asked and solved this exact doubt.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-xs text-[#A1A1AA] hover:text-white hover:bg-white/5 h-8 px-2.5 gap-1 shrink-0"
            title="Continue posting your question"
          >
            <span>Continue Posting</span>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Suggestions List */}
        <div className="space-y-2.5 relative z-10">
          {suggestions.map((doubt) => (
            <div
              key={doubt.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#141414]/90 border border-white/5 hover:border-purple-500/40 hover:bg-[#181818] transition-all gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] border-white/10 text-gray-300 py-0">
                    {doubt.subject}
                  </Badge>

                  {doubt.isResolved ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Solved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Clock className="w-3 h-3" /> Open
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-[11px] text-[#71717A]">
                    <MessageSquare className="w-3 h-3 text-purple-400" />
                    {doubt.answersCount} {doubt.answersCount === 1 ? "answer" : "answers"}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white truncate hover:text-purple-300 transition-colors">
                  {doubt.title}
                </h4>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <a
                  href={`/doubts/${doubt.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all"
                >
                  <span>View Doubt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info & explicit Continue action */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#71717A] relative z-10">
          <span>
            None of these answer your specific problem? You can post your question below.
          </span>
          <button
            type="button"
            onClick={onDismiss}
            className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1"
          >
            <span>Continue with my question</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

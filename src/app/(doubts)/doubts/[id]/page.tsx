"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, MessageCircle, ThumbsUp, Send, Loader2, 
  Share2, Flag, Bookmark, Paperclip, Trophy, MessageSquare 
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function DoubtDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const routeParams = useParams();
  const doubtId = (routeParams?.id as string) || "";
  const [doubt, setDoubt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (doubtId) {
      fetchDoubt();
    }
  }, [doubtId]);

  const fetchDoubt = async () => {
    try {
      const res = await fetch(`/api/doubts/${doubtId}`);
      const data = await res.json();
      setDoubt(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnswer = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/doubts/${doubtId}`);
      return;
    }
    if (!answerContent.trim()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/doubts/${doubtId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: answerContent }),
      });
      if (res.ok) {
        setAnswerContent("");
        fetchDoubt(); // Refresh answers
      } else {
        const errText = await res.text();
        setSubmitError(errText || "Failed to post answer. Please try again.");
      }
    } catch (e: any) {
      console.error(e);
      setSubmitError(e.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkBest = async (answerId: string) => {
    try {
      const res = await fetch(`/api/doubts/${doubtId}/answers/${answerId}/best`, {
        method: "POST"
      });
      if (res.ok) fetchDoubt();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMessage = async (targetUserId: string) => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId })
      });
      if (res.ok) {
        const conv = await res.json();
        router.push(`/messages/${conv.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#71717A]" /></div>;
  }

  if (!doubt) {
    return <div className="text-center text-white mt-20">Doubt not found.</div>;
  }

  const isOwner = session?.user && (session.user as any).id === doubt.authorId;
  const tags = doubt.tags ? doubt.tags.split(',').map((t: string) => t.trim()) : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      
      {/* Question Card */}
      <Card className={`border-white/10 backdrop-blur-xl ${doubt.isResolved ? 'bg-[#111111]/80 border-green-500/30' : 'bg-[#111111]/80'}`}>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-white/10">
                <AvatarFallback className="bg-[#070707] text-white">
                  {doubt.author.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium text-lg leading-none mb-1.5 flex items-center gap-2">
                  {doubt.author.fullName}
                  {doubt.isResolved && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </p>
                <p className="text-sm text-[#A1A1AA]">
                  {doubt.author.academicYear} • {doubt.author.branch} • {formatDistanceToNow(new Date(doubt.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {!isOwner && (
                <Button onClick={() => handleMessage(doubt.authorId)} variant="outline" className="bg-[#070707] border-white/10 text-white hover:bg-white/10 h-9 px-4 hidden md:flex">
                  <MessageSquare className="w-4 h-4 mr-2" /> Message
                </Button>
              )}
              <Button variant="outline" size="icon" className="bg-[#070707] border-white/10 text-[#A1A1AA] hover:text-white"><Bookmark className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="bg-[#070707] border-white/10 text-[#A1A1AA] hover:text-white"><Share2 className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="bg-[#070707] border-white/10 text-red-400/70 hover:text-red-400"><Flag className="w-4 h-4" /></Button>
            </div>
          </div>

          <Badge className="mb-4 bg-purple-500/10 text-purple-400 border border-purple-500/20">{doubt.subject}</Badge>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {doubt.title}
          </h1>
          <p className="text-[#A1A1AA] leading-relaxed whitespace-pre-wrap mb-6 text-lg">
            {doubt.description}
          </p>

          {doubt.attachmentUrl && (
            <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5 flex items-center gap-3 w-max">
              <Paperclip className="w-5 h-5 text-[#A1A1AA]" />
              <span className="text-blue-400 hover:underline cursor-pointer">Attached_Document.pdf</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10">
            {tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="bg-[#070707] text-[#71717A]">#{tag}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Answer Submission */}
      {!isOwner && !doubt.isResolved && (
        <Card className="bg-[#111111]/80 border-white/10 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-6">
            <h3 className="text-white font-medium mb-4 flex items-center justify-between">
              <span>Know the answer? Help your peer!</span>
              <span className="text-xs text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 font-normal">
                +5 Contribution Points
              </span>
            </h3>

            {submitError && (
              <div className="mb-4 p-3 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                {submitError}
              </div>
            )}

            {!session?.user ? (
              <div className="p-6 text-center rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-sm text-[#A1A1AA]">
                  Are you a senior or peer who can answer this doubt?
                </p>
                <Link href={`/login?callbackUrl=/doubts/${doubtId}`}>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-6">
                    Sign in to Post Answer
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Textarea 
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="Write your detailed step-by-step explanation here..." 
                  className="bg-[#070707] border-white/10 text-white min-h-[120px] mb-4 focus-visible:ring-purple-500/50"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-[#71717A]">Markdown is supported. Be respectful and clear.</p>
                  <Button 
                    onClick={handlePostAnswer}
                    disabled={isSubmitting || !answerContent.trim()}
                    className="bg-white text-black hover:bg-white/90"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Post Answer
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {doubt.isResolved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>This doubt has been marked as resolved by the author. Browse the best answer below!</span>
        </div>
      )}

      {/* Answers Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" /> {doubt.answers.length} Answers
        </h3>
        
        <AnimatePresence>
          {doubt.answers.map((answer: any) => (
            <motion.div 
              key={answer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border ${answer.isBest ? 'border-green-500/50 bg-gradient-to-br from-[#111111]/90 to-green-900/10' : 'border-white/10 bg-[#111111]/80'} p-6 backdrop-blur-xl shadow-lg relative overflow-hidden`}
            >
              {answer.isBest && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
              )}
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarFallback className="bg-[#070707] text-[#A1A1AA]">{answer.author.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{answer.author.fullName}</p>
                      {answer.isBest && <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30"><Trophy className="w-3 h-3 mr-1" /> Best Answer</Badge>}
                    </div>
                    <p className="text-xs text-[#71717A]">
                      {answer.author.academicYear} • {answer.author.points} Contribution Points • {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isOwner && !doubt.isResolved && (
                    <Button 
                      onClick={() => handleMarkBest(answer.id)}
                      variant="outline" 
                      className="border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20 hover:text-green-300 h-8 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark as Best
                    </Button>
                  )}
                  {(!session?.user || (session.user as any).id !== answer.authorId) && (
                    <Button onClick={() => handleMessage(answer.authorId)} variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-8 px-3 text-xs">
                      <MessageSquare className="w-3 h-3 mr-1.5" /> Message
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-[#E4E4E7] whitespace-pre-wrap leading-relaxed relative z-10">
                {answer.content}
              </p>

              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/5 relative z-10">
                <button className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white transition-colors">
                  <ThumbsUp className="w-4 h-4" /> Helpful ({answer._count.votes})
                </button>
                <button className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white transition-colors">
                  <MessageCircle className="w-4 h-4" /> Reply
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {doubt.answers.length === 0 && (
          <div className="text-center py-12 bg-[#111111]/50 border border-white/5 rounded-xl">
            <p className="text-[#A1A1AA]">No answers yet. Be the first to help out!</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, Star, HelpCircle, MessageSquare, ChevronLeft, 
  CheckCircle2, ThumbsUp, Send, ShieldCheck, Zap, BookOpen, Wrench 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      doubts: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { answers: true, votes: true } }
        }
      },
      answers: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          doubt: { select: { id: true, title: true, subject: true } },
          _count: { select: { votes: true } }
        }
      },
      _count: {
        select: {
          doubts: true,
          answers: true,
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  // Calculate Contribution Rank
  let level = "Beginner";
  let badgeColor = "text-gray-400 border-gray-500/30 bg-gray-500/10";
  if (user.points >= 50) {
    level = "Learner";
    badgeColor = "text-blue-400 border-blue-500/30 bg-blue-500/10";
  }
  if (user.points >= 150) {
    level = "Contributor";
    badgeColor = "text-purple-400 border-purple-500/30 bg-purple-500/10";
  }
  if (user.points >= 400) {
    level = "Campus Mentor";
    badgeColor = "text-amber-400 border-amber-500/30 bg-amber-500/10";
  }

  const bestAnswersCount = user.answers.filter((a) => a.isBest).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Link */}
      <Link
        href="/doubts"
        className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-white transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Doubts
      </Link>

      {/* Profile Header Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#14121d] via-[#111111] to-[#0d0d0d] border border-white/10 backdrop-blur-xl shadow-2xl mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <Avatar className="w-20 h-20 border-2 border-purple-500/40 shadow-xl shadow-purple-500/10">
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-tr from-purple-600 to-indigo-600 text-white">
                {user.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {user.fullName}
                </h1>
                <Badge className={`${badgeColor} text-xs font-semibold py-0.5 px-2.5`}>
                  ★ {level}
                </Badge>
              </div>
              <p className="text-sm text-[#A1A1AA]">{user.college}</p>
              <p className="text-xs text-[#71717A] mt-1">
                {user.academicYear} • {user.branch}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/messages" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white text-xs gap-2 font-medium">
                <Send className="w-3.5 h-3.5" /> Message Peer
              </Button>
            </Link>
          </div>
        </div>

        {/* Reputation Points Strip */}
        <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 text-center sm:text-left">
          <div>
            <p className="text-xs text-[#71717A] uppercase font-semibold">Reputation</p>
            <p className="text-2xl font-bold text-purple-400 mt-0.5">{user.points} pts</p>
          </div>
          <div>
            <p className="text-xs text-[#71717A] uppercase font-semibold">Doubts Asked</p>
            <p className="text-2xl font-bold text-white mt-0.5">{user._count.doubts}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717A] uppercase font-semibold">Answers Given</p>
            <p className="text-2xl font-bold text-white mt-0.5">{user._count.answers}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717A] uppercase font-semibold">Best Solutions</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">{bestAnswersCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Subjects & Skills */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-[#111111]/80 border border-white/10 backdrop-blur-xl shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" /> Subjects
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {user.subjects
                ? user.subjects.split(",").map((s) => s.trim()).filter(Boolean).map((subj) => (
                    <Badge key={subj} variant="outline" className="text-xs border-white/10 text-gray-300">
                      {subj}
                    </Badge>
                  ))
                : <span className="text-xs text-[#71717A]">No subjects listed</span>}
            </div>

            <h3 className="text-sm font-bold text-white mt-6 mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" /> Skills & Tools
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {user.skills
                ? user.skills.split(",").map((s) => s.trim()).filter(Boolean).map((sk) => (
                    <Badge key={sk} variant="secondary" className="text-xs bg-white/5 text-purple-300">
                      {sk}
                    </Badge>
                  ))
                : <span className="text-xs text-[#71717A]">No skills listed</span>}
            </div>
          </div>
        </div>

        {/* Right Col: Doubts & Answers */}
        <div className="md:col-span-2 space-y-8">
          {/* Recent Doubts */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-400" /> Questions Asked ({user.doubts.length})
            </h3>
            {user.doubts.length === 0 ? (
              <p className="text-xs text-[#71717A]">No doubts asked yet.</p>
            ) : (
              <div className="space-y-3">
                {user.doubts.map((doubt) => (
                  <Link key={doubt.id} href={`/doubts/${doubt.id}`} className="block group">
                    <div className="p-4 rounded-xl bg-[#111111]/60 border border-white/10 hover:border-purple-500/30 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-purple-400 font-medium">{doubt.subject}</span>
                        {doubt.isResolved && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            Solved
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {doubt.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-[#71717A]">
                        <span>{doubt._count.answers} answers</span>
                        <span>{doubt._count.votes} votes</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Solutions & Answers */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Recent Solutions Contributed
            </h3>
            {user.answers.length === 0 ? (
              <p className="text-xs text-[#71717A]">No answers contributed yet.</p>
            ) : (
              <div className="space-y-3">
                {user.answers.map((ans) => (
                  <Link key={ans.id} href={`/doubts/${ans.doubt.id}`} className="block group">
                    <div className="p-4 rounded-xl bg-[#111111]/60 border border-white/10 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-emerald-400 font-medium">{ans.doubt.subject}</span>
                        {ans.isBest && (
                          <Badge className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                            ★ Best Solution
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#71717A] mb-1">Answered on: {ans.doubt.title}</p>
                      <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                        {ans.content}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  BookOpen, Sparkles, MessageSquare, Users, ChevronLeft, 
  HelpCircle, ThumbsUp, CheckCircle2, ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SUBJECTS_CATALOG } from "@/lib/subjects-data";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const subject = SUBJECTS_CATALOG.find((s) => s.id === id);
  if (!subject) {
    notFound();
  }

  // Fetch doubts for this subject from DB
  const doubts = await prisma.doubt.findMany({
    where: {
      OR: [
        { subject: { contains: subject.name } },
        { subject: { contains: subject.id } },
        { tags: { contains: subject.id } },
        { tags: { contains: subject.name.toLowerCase() } }
      ]
    },
    include: {
      author: {
        select: { id: true, fullName: true, academicYear: true, branch: true }
      },
      _count: {
        select: { answers: true, votes: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  // Fetch student mentors who list this subject or skills
  const mentors = await prisma.user.findMany({
    where: {
      OR: [
        { subjects: { contains: subject.name } },
        { subjects: { contains: subject.id } },
        { skills: { contains: subject.name } }
      ]
    },
    orderBy: { points: "desc" },
    take: 5,
    select: {
      id: true,
      fullName: true,
      academicYear: true,
      branch: true,
      points: true,
      skills: true,
    }
  });

  const Icon = subject.icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back button */}
      <Link
        href="/subjects"
        className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-white transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to all subjects
      </Link>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#111111] to-[#0d0d0d] border border-white/10 p-8 md:p-10 mb-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-500/10">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30 text-xs">
                  {subject.domain}
                </Badge>
                <span className="text-xs text-[#71717A]">
                  {doubts.length} Active Questions
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {subject.name}
              </h1>
              <p className="text-sm text-[#A1A1AA] mt-2 max-w-2xl leading-relaxed">
                {subject.description}
              </p>
            </div>
          </div>

          <Link href={`/ask-doubt?subject=${encodeURIComponent(subject.name)}`}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-6 shadow-lg shadow-purple-600/25 shrink-0 gap-2 font-medium">
              <Sparkles className="w-4 h-4" /> Ask a Doubt in this Subject
            </Button>
          </Link>
        </div>

        {/* Syllabus / Key Topics pills */}
        <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
          <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-3">
            Core Topics & Syllabus
          </p>
          <div className="flex flex-wrap gap-2">
            {subject.topics.map((topic) => (
              <Link key={topic.id} href={`/subjects/${subject.id}/topics/${topic.id}`}>
                <span
                  className="text-xs px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer block"
                >
                  {topic.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Doubts list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              Community Doubts ({doubts.length})
            </h2>
          </div>

          {doubts.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/5 bg-[#111111]/40">
              <HelpCircle className="w-12 h-12 text-[#71717A] mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">
                No doubts posted in {subject.name} yet
              </h3>
              <p className="text-xs text-[#71717A] max-w-sm mx-auto mb-4">
                Be the first student to ask a question in this subject and get help from verified mentors.
              </p>
              <Link href={`/ask-doubt?subject=${encodeURIComponent(subject.name)}`}>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                  Ask the First Doubt
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {doubts.map((doubt: any) => (
                <Link key={doubt.id} href={`/doubts/${doubt.id}`} className="block group">
                  <div className="p-5 rounded-2xl bg-[#111111]/70 border border-white/10 hover:border-purple-500/40 hover:bg-[#141414] transition-all backdrop-blur-xl shadow-lg">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        {doubt.isResolved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Solved
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                            Open
                          </span>
                        )}
                        <span className="text-xs text-[#71717A]">{doubt.topic}</span>
                      </div>
                      <span className="text-xs text-[#71717A]">{doubt.targetYear}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors mb-2 leading-snug">
                      {doubt.title}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] line-clamp-2 mb-4 leading-relaxed">
                      {doubt.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-[#71717A]">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[9px] bg-[#1a1a1a]">
                            {doubt.author.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white">{doubt.author.fullName}</span>
                        <span>•</span>
                        <span>{doubt.author.branch}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                          {doubt._count.answers} answers
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                          {doubt._count.votes} votes
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Top Mentors & Resources */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#111111]/70 border border-white/10 backdrop-blur-xl shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> Top Subject Mentors
            </h3>

            {mentors.length === 0 ? (
              <p className="text-xs text-[#71717A]">No mentors listed for this subject yet.</p>
            ) : (
              <div className="space-y-3">
                {mentors.map((m: any) => (
                  <Link key={m.id} href={`/profile/${m.id}`} className="block group">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-xs">
                            {m.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {m.fullName}
                          </p>
                          <p className="text-[10px] text-[#71717A]">{m.academicYear} • {m.branch.split(' ')[0]}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-purple-400">
                        ★ {m.points}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#161224] to-[#111111] border border-purple-500/20 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Need Instant Help?
            </h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
              Ask DoubtConnect's 24/7 AI Tutor to explain complex {subject.name} concepts or review your homework problem.
            </p>
            <Link href={`/ai-assistant?subject=${encodeURIComponent(subject.name)}`}>
              <Button size="sm" className="w-full bg-white text-black hover:bg-white/90 text-xs font-semibold">
                Open AI Tutor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

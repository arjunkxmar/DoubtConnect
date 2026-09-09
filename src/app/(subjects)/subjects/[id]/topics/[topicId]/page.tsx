import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen, Sparkles, MessageSquare, Users, ChevronLeft,
  HelpCircle, ThumbsUp, CheckCircle2, ArrowRight,
  FileText, ExternalLink, Brain, Send, GraduationCap,
  Lightbulb, Bookmark, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SUBJECTS_CATALOG } from "@/lib/subjects-data";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string; topicId: string }>;
}) {
  const { id: subjectId, topicId } = await params;

  const subject = SUBJECTS_CATALOG.find((s) => s.id === subjectId);
  if (!subject) notFound();

  const topic = subject.topics.find((t) => t.id === topicId);
  if (!topic) notFound();

  const Icon = subject.icon;

  // ── Fetch doubts matching this topic ──
  const doubts = await prisma.doubt.findMany({
    where: {
      OR: [
        { topic: { contains: topic.name } },
        { topic: { contains: topic.id } },
        { tags: { contains: topic.id } },
        { tags: { contains: topic.name.toLowerCase() } },
        {
          AND: [
            { subject: { contains: subject.name } },
            { topic: { contains: topic.name } }
          ]
        }
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
    take: 15
  });

  const solvedDoubts = doubts.filter(d => d.isResolved);
  const openDoubts = doubts.filter(d => !d.isResolved);

  // ── Popular doubts (most answers) ──
  const popularDoubts = [...doubts]
    .sort((a, b) => (b._count.answers + b._count.votes) - (a._count.answers + a._count.votes))
    .slice(0, 5);

  // ── Community Resources (notes, resources, learning tips) ──
  const resources = await prisma.post.findMany({
    where: {
      type: { in: ["resource", "notes", "learning_tip"] },
      OR: [
        { tags: { contains: topic.id } },
        { tags: { contains: topic.name.toLowerCase() } },
        { subject: { contains: topic.name } },
        {
          AND: [
            { subject: { contains: subject.name } },
            { tags: { contains: topic.name.toLowerCase() } }
          ]
        }
      ]
    },
    include: {
      author: {
        select: { id: true, fullName: true, academicYear: true, branch: true }
      },
      _count: { select: { likes: true, comments: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 8
  });

  // ── Helpful contributors (users who answered doubts in this topic or list it as a skill) ──
  const contributors = await prisma.user.findMany({
    where: {
      OR: [
        { skills: { contains: topic.name } },
        { skills: { contains: topic.id } },
        { subjects: { contains: subject.name } }
      ]
    },
    orderBy: { points: "desc" },
    take: 6,
    select: {
      id: true,
      fullName: true,
      academicYear: true,
      branch: true,
      points: true,
      skills: true,
    }
  });

  // ── Related topics (other topics in the same subject) ──
  const relatedTopics = subject.topics.filter(t => t.id !== topic.id);

  // ── Resource type display helpers ──
  const resourceTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
    resource: { label: "Resource", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    notes: { label: "Notes", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    learning_tip: { label: "Learning Tip", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#71717A] mb-6">
        <Link href="/subjects" className="hover:text-white transition-colors">Subjects</Link>
        <span>/</span>
        <Link href={`/subjects/${subject.id}`} className="hover:text-white transition-colors">{subject.name}</Link>
        <span>/</span>
        <span className="text-white font-medium">{topic.name}</span>
      </nav>

      {/* ═══════════════════════════════════ Hero ═══════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/50 via-[#111111] to-[#0d0d0d] border border-white/10 p-8 md:p-10 mb-8 backdrop-blur-xl shadow-2xl">
        {/* Background decoration */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-500/10">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30 text-xs">
                  {subject.name}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {topic.name}
              </h1>
              <p className="text-sm text-[#A1A1AA] mt-2 max-w-2xl leading-relaxed">
                {topic.description}
              </p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-8 pt-6 border-t border-white/5 relative z-10 flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{doubts.length}</p>
              <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Total Doubts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{solvedDoubts.length}</p>
              <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Solved</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{contributors.length}</p>
              <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Contributors</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{resources.length}</p>
              <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Resources</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap gap-3 relative z-10">
          <Link href={`/ask-doubt?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(topic.name)}`}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white h-10 px-5 shadow-lg shadow-purple-600/25 gap-2 font-medium text-sm">
              <Send className="w-4 h-4" /> Ask Doubt
            </Button>
          </Link>
          <Link href={`/ai-assistant?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(topic.name)}`}>
            <Button className="bg-white text-black hover:bg-white/90 h-10 px-5 gap-2 font-medium text-sm">
              <Sparkles className="w-4 h-4" /> Ask AI
            </Button>
          </Link>
          <Link href={`/messages?context=${encodeURIComponent(topic.name + ' in ' + subject.name)}`}>
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/10 h-10 px-5 gap-2 font-medium text-sm">
              <GraduationCap className="w-4 h-4" /> Ask Senior
            </Button>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════ Content Grid ═══════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left 2 Cols: Doubts & Resources ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Popular Doubts */}
          {popularDoubts.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-amber-400" /> Popular Questions
              </h2>
              <div className="space-y-3">
                {popularDoubts.map((doubt) => (
                  <Link key={doubt.id} href={`/doubts/${doubt.id}`} className="block group">
                    <div className="p-4 rounded-2xl bg-[#111111]/70 border border-white/10 hover:border-amber-500/30 hover:bg-[#141414] transition-all backdrop-blur-xl shadow-lg">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2">
                          {doubt.isResolved ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Solved
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              Open
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#71717A]">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-purple-400" />
                            {doubt._count.answers}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-blue-400" />
                            {doubt._count.votes}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors leading-snug mb-1">
                        {doubt.title}
                      </h3>
                      <p className="text-xs text-[#A1A1AA] line-clamp-1 leading-relaxed">
                        {doubt.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-[#71717A]">
                        <span className="text-white">{doubt.author.fullName}</span>
                        <span>•</span>
                        <span>{doubt.author.branch}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent Doubts */}
          <section>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-purple-400" /> Recent Doubts ({doubts.length})
            </h2>

            {doubts.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-white/5 bg-[#111111]/40">
                <HelpCircle className="w-12 h-12 text-[#71717A] mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white mb-1">
                  No doubts in {topic.name} yet
                </h3>
                <p className="text-xs text-[#71717A] max-w-sm mx-auto mb-4">
                  Be the first student to ask a question about {topic.name} and get help from seniors and AI.
                </p>
                <Link href={`/ask-doubt?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(topic.name)}`}>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Ask the First Doubt
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {doubts.map((doubt) => (
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
          </section>

          {/* ── Resources Section ── */}
          <section>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Bookmark className="w-5 h-5 text-blue-400" /> Resources & Study Material
            </h2>

            {resources.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-white/5 bg-[#111111]/40">
                <FileText className="w-10 h-10 text-[#71717A] mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">No resources shared yet</h3>
                <p className="text-xs text-[#71717A] max-w-sm mx-auto mb-4">
                  Share your notes, links, or study material about {topic.name} to help others.
                </p>
                <Link href={`/community?type=resource`}>
                  <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/10 text-xs gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Share a Resource
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resources.map((res) => {
                  const typeConf = resourceTypeConfig[res.type] || resourceTypeConfig.resource;
                  return (
                    <div key={res.id} className="p-4 rounded-2xl bg-[#111111]/70 border border-white/10 hover:border-blue-500/30 hover:bg-[#141414] transition-all group">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-[10px] ${typeConf.color} ${typeConf.bg} border`}>
                          {typeConf.label}
                        </Badge>
                      </div>
                      {res.title && (
                        <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
                          {res.title}
                        </h4>
                      )}
                      <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed mb-3">
                        {res.content}
                      </p>

                      {res.imageUrl && (
                        <a href={res.imageUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] text-purple-400 hover:text-purple-300 transition-colors mb-3">
                          <ExternalLink className="w-3 h-3" /> View Attachment
                        </a>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-[#71717A]">
                        <span>{res.author.fullName}</span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-blue-400" /> {res._count.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-purple-400" /> {res._count.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ── Right Col: Contributors & Related Topics ── */}
        <div className="space-y-6">

          {/* Helpful Contributors */}
          <div className="p-6 rounded-2xl bg-[#111111]/70 border border-white/10 backdrop-blur-xl shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> Helpful Contributors
            </h3>

            {contributors.length === 0 ? (
              <p className="text-xs text-[#71717A]">No contributors found for this topic yet.</p>
            ) : (
              <div className="space-y-3">
                {contributors.map((c) => (
                  <Link key={c.id} href={`/profile/${c.id}`} className="block group">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-xs">
                            {c.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {c.fullName}
                          </p>
                          <p className="text-[10px] text-[#71717A]">{c.academicYear} • {c.branch?.split(' ')[0]}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-purple-400">
                        ★ {c.points}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Related Topics */}
          {relatedTopics.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#111111]/70 border border-white/10 backdrop-blur-xl shadow-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" /> Related Topics
              </h3>
              <div className="space-y-2">
                {relatedTopics.map((t) => (
                  <Link key={t.id} href={`/subjects/${subject.id}/topics/${t.id}`} className="block group">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group-hover:border-indigo-500/20">
                      <div>
                        <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {t.name}
                        </p>
                        <p className="text-[10px] text-[#71717A] line-clamp-1 mt-0.5">{t.description}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#71717A] group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ask AI Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#161224] to-[#111111] border border-purple-500/20 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Instant Help
            </h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
              Get instant explanations on {topic.name} concepts from the 24/7 AI Tutor, or ask a senior directly.
            </p>
            <div className="space-y-2">
              <Link href={`/ai-assistant?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(topic.name)}`}>
                <Button size="sm" className="w-full bg-white text-black hover:bg-white/90 text-xs font-semibold gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Open AI Tutor
                </Button>
              </Link>
              <Link href={`/messages?context=${encodeURIComponent(topic.name + ' in ' + subject.name)}`}>
                <Button size="sm" variant="outline" className="w-full border-white/10 text-white hover:bg-white/10 text-xs font-semibold gap-1.5 mt-2">
                  <GraduationCap className="w-3.5 h-3.5" /> Message a Senior
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

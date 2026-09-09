"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Heart, MessageCircle, Bookmark, Share2, Flag, Send,
  Plus, X, BookOpen, Trophy, Calendar, Lightbulb,
  Briefcase, Users, TrendingUp, Loader2, Sparkles,
  Pencil, Trash2, MoreHorizontal, Star, Megaphone,
  CheckCircle2, Brain, FileText, Link2, Image
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PostAuthor {
  id: string; fullName: string; academicYear: string; branch: string; college: string;
}
interface Comment {
  id: string; content: string;
  user: { id: string; fullName: string; academicYear: string };
  createdAt: string;
}
interface Post {
  id: string; type: string; title: string | null; content: string;
  tags: string[]; subject: string | null; imageUrl: string | null;
  author: PostAuthor; likeCount: number; commentCount: number;
  isLiked: boolean; isSaved: boolean; isReported: boolean;
  comments: Comment[]; createdAt: string; updatedAt: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TABS = [
  { id: "latest",      label: "Latest",      icon: Sparkles },
  { id: "trending",    label: "Trending",    icon: TrendingUp },
  { id: "my-college",  label: "My College",  icon: Users },
  { id: "my-branch",   label: "My Branch",   icon: BookOpen },
  { id: "my-subjects", label: "My Subjects", icon: Brain },
  { id: "saved",       label: "Saved",       icon: Bookmark },
];

const POST_TYPES = [
  { id: "discussion",   label: "Discussion",    icon: MessageCircle, color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
  { id: "resource",     label: "Resource",      icon: BookOpen,      color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
  { id: "notes",        label: "Notes",         icon: FileText,      color: "text-teal-400",   bg: "bg-teal-500/10 border-teal-500/20" },
  { id: "skill",        label: "Skill",         icon: Star,          color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
  { id: "achievement",  label: "Achievement",   icon: Trophy,        color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { id: "event",        label: "Event",         icon: Calendar,      color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { id: "opportunity",  label: "Opportunity",   icon: Briefcase,     color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { id: "learning_tip", label: "Learning Tip",  icon: Lightbulb,     color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/20" },
  { id: "announcement", label: "Announcement",  icon: Megaphone,     color: "text-rose-400",   bg: "bg-rose-500/10 border-rose-500/20" },
];

function getTypeConfig(type: string) {
  return POST_TYPES.find(t => t.id === type) ?? POST_TYPES[0];
}

const REPORT_REASONS = [
  "Spam or irrelevant content",
  "Inappropriate or offensive content",
  "Misinformation",
  "Off-topic (not academic)",
  "Other",
];

// ─── Create / Edit Modal ─────────────────────────────────────────────────────

function PostFormModal({
  onClose,
  onSave,
  editingPost,
}: {
  onClose: () => void;
  onSave: (post: Post) => void;
  editingPost?: Post | null;
}) {
  const isEditing = !!editingPost;
  const [content, setContent] = useState(editingPost?.content ?? "");
  const [title, setTitle] = useState(editingPost?.title ?? "");
  const [type, setType] = useState(editingPost?.type ?? "discussion");
  const [tags, setTags] = useState(editingPost?.tags.join(", ") ?? "");
  const [subject, setSubject] = useState(editingPost?.subject ?? "");
  const [imageUrl, setImageUrl] = useState(editingPost?.imageUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) { setError("Please write something."); return; }
    setLoading(true); setError("");
    try {
      const url = isEditing ? `/api/community/${editingPost!.id}` : "/api/community";
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim() || undefined,
          content,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          subject: subject.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined
        })
      });
      if (!res.ok) { setError("Something went wrong. Please try again."); return; }
      const saved = await res.json();
      onSave(saved);
      onClose();
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <h2 className="text-white font-semibold">{isEditing ? "Edit Post" : "Share with the Community"}</h2>
          <button onClick={onClose} className="text-[#71717A] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Post type */}
          <div>
            <p className="text-xs text-[#71717A] mb-2 font-medium">Post Type</p>
            <div className="flex flex-wrap gap-1.5">
              {POST_TYPES.map(({ id, label, icon: Icon, color, bg }) => (
                <button
                  key={id}
                  onClick={() => setType(id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs transition-all ${type === id ? `${bg} ${color} font-medium` : "border-white/10 text-[#71717A] hover:border-white/20 hover:text-white"}`}
                >
                  <Icon className="w-3 h-3" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title (optional) */}
          <div>
            <p className="text-xs text-[#71717A] mb-1 font-medium">Title <span className="text-[#4B4B52]">(optional)</span></p>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your post a short headline…"
              className="w-full bg-[#070707] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-[#4B4B52] focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Content */}
          <div>
            <p className="text-xs text-[#71717A] mb-1 font-medium">Content <span className="text-red-400">*</span></p>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share a resource, achievement, event, skill, study tip, or start a discussion…"
              className="bg-[#070707] border-white/10 text-white placeholder:text-[#4B4B52] min-h-[120px] focus-visible:ring-purple-500/50 resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-[10px] ${content.length > 1000 ? "text-red-400" : "text-[#4B4B52]"}`}>{content.length}/1000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-[#71717A] mb-1 font-medium">Subject <span className="text-[#4B4B52]">(optional)</span></p>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g., Data Structures"
                className="w-full bg-[#070707] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-[#4B4B52] focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <p className="text-xs text-[#71717A] mb-1 font-medium">Tags <span className="text-[#4B4B52]">(comma separated)</span></p>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="e.g., python, exam, tips"
                className="w-full bg-[#070707] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-[#4B4B52] focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          {/* Image / Attachment URL */}
          <div>
            <p className="text-xs text-[#71717A] mb-1 font-medium flex items-center gap-1.5">
              <Image className="w-3 h-3" /> Attachment URL <span className="text-[#4B4B52]">(optional)</span>
            </p>
            <input
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full bg-[#070707] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-[#4B4B52] focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex justify-end gap-2 shrink-0 border-t border-white/5 pt-4">
          <Button variant="ghost" onClick={onClose} className="text-[#71717A] hover:text-white">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || loading || content.length > 1000}
            className="bg-white text-black hover:bg-white/90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            {isEditing ? "Save Changes" : "Post"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Report Modal ────────────────────────────────────────────────────────────

function ReportModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReport = async () => {
    setLoading(true);
    try {
      await fetch(`/api/community/${postId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      setDone(true);
    } catch { console.error("Report failed"); }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl"
      >
        {done ? (
          <div className="flex flex-col items-center py-4 text-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
            <p className="text-white font-medium">Report submitted</p>
            <p className="text-[#71717A] text-sm">Thank you. We'll review this content.</p>
            <Button onClick={onClose} variant="outline" className="border-white/10 text-white hover:bg-white/10 mt-2">Close</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2"><Flag className="w-4 h-4 text-red-400" /> Report Post</h3>
              <button onClick={onClose} className="text-[#71717A] hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-[#71717A] mb-3">Select a reason:</p>
            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${reason === r ? "bg-red-500/10 border border-red-500/30 text-red-300" : "text-[#A1A1AA] hover:bg-white/5 border border-transparent"}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button onClick={handleReport} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Flag className="w-4 h-4 mr-2" />}
              Submit Report
            </Button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteModal({ postId, onClose, onDeleted }: { postId: string; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/${postId}`, { method: "DELETE" });
      if (res.ok) { onDeleted(); onClose(); }
    } catch { console.error("Delete failed"); }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl"
      >
        <h3 className="text-white font-semibold mb-2">Delete Post?</h3>
        <p className="text-[#71717A] text-sm mb-5">This action cannot be undone. The post and all comments will be permanently removed.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-white hover:bg-white/10">Cancel</Button>
          <Button onClick={handleDelete} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Post Card ───────────────────────────────────────────────────────────────

function PostCard({
  post, currentUserId, onEdit, onDelete
}: {
  post: Post; currentUserId: string; onEdit: (p: Post) => void; onDelete: (id: string) => void;
}) {
  const typeConfig = getTypeConfig(post.type);
  const TypeIcon = typeConfig.icon;
  const isOwner = post.author.id === currentUserId;

  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  useEffect(() => { setLocalPost(post); }, [post]);

  const handleLike = async () => {
    const optimistic = { ...localPost, isLiked: !localPost.isLiked, likeCount: localPost.isLiked ? localPost.likeCount - 1 : localPost.likeCount + 1 };
    setLocalPost(optimistic);
    try { await fetch(`/api/community/${post.id}/like`, { method: "POST" }); }
    catch { setLocalPost(localPost); }
  };

  const handleSave = async () => {
    setLocalPost(p => ({ ...p, isSaved: !p.isSaved }));
    try { await fetch(`/api/community/${post.id}/save`, { method: "POST" }); }
    catch { setLocalPost(localPost); }
  };

  const handleComment = async () => {
    if (!commentInput.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/community/${post.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentInput.trim() })
      });
      if (res.ok) {
        const newComment = await res.json();
        setLocalPost(p => ({ ...p, comments: [...p.comments, newComment], commentCount: p.commentCount + 1 }));
        setCommentInput("");
      }
    } catch { console.error("Comment failed"); }
    finally { setSubmittingComment(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/community/${post.id}/comment`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId })
      });
      if (res.ok) {
        setLocalPost(p => ({ ...p, comments: p.comments.filter(c => c.id !== commentId), commentCount: p.commentCount - 1 }));
      }
    } catch { console.error("Delete comment failed"); }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/community`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch { console.error("Copy failed"); }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111111] border border-white/8 rounded-2xl overflow-hidden hover:border-white/14 transition-colors"
      >
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-white/10 shrink-0">
                <AvatarFallback className="bg-[#070707] text-white text-sm">{localPost.author.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium text-sm leading-none mb-1">{localPost.author.fullName}</p>
                <p className="text-xs text-[#71717A]">{localPost.author.academicYear} · {localPost.author.branch}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                <TypeIcon className="w-3 h-3" /> {typeConfig.label}
              </span>
              <span className="text-xs text-[#4B4B52] hidden sm:block">
                {formatDistanceToNow(new Date(localPost.createdAt), { addSuffix: true })}
              </span>

              {/* Options menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(v => !v)}
                  className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      className="absolute right-0 top-8 z-30 bg-[#1a1a1a] border border-white/10 rounded-xl py-1 w-36 shadow-2xl"
                    >
                      {isOwner ? (
                        <>
                          <button
                            onClick={() => { setShowMenu(false); onEdit(localPost); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A1A1AA] hover:text-white hover:bg-white/5"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit Post
                          </button>
                          <button
                            onClick={() => { setShowMenu(false); setShowDelete(true); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Post
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { setShowMenu(false); setShowReport(true); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          {localPost.isReported ? "Reported" : "Report Post"}
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Subject */}
          {localPost.subject && (
            <Badge className="mb-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs">
              {localPost.subject}
            </Badge>
          )}

          {/* Title */}
          {localPost.title && (
            <p className="text-white font-semibold text-base mb-1">{localPost.title}</p>
          )}

          {/* Content */}
          <p className="text-[#E4E4E7] text-sm leading-relaxed whitespace-pre-wrap">{localPost.content}</p>

          {/* Attached Image */}
          {localPost.imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-white/8">
              <img
                src={localPost.imageUrl}
                alt="Post attachment"
                className="w-full max-h-80 object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          {/* Edited indicator */}
          {localPost.updatedAt !== localPost.createdAt && (
            <p className="text-[10px] text-[#4B4B52] mt-1">edited</p>
          )}

          {/* Tags */}
          {localPost.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {localPost.tags.map(tag => (
                <span key={tag} className="text-[10px] text-[#71717A] bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-0.5 px-3 py-2 border-t border-white/5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${localPost.isLiked ? "text-rose-400 bg-rose-500/10" : "text-[#71717A] hover:text-white hover:bg-white/5"}`}
          >
            <Heart className={`w-3.5 h-3.5 ${localPost.isLiked ? "fill-current" : ""}`} />
            {localPost.likeCount > 0 && <span className="font-medium">{localPost.likeCount}</span>}
            <span>Helpful</span>
          </button>

          <button
            onClick={() => setShowComments(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${showComments ? "text-blue-400 bg-blue-500/10" : "text-[#71717A] hover:text-white hover:bg-white/5"}`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {localPost.commentCount > 0 && <span className="font-medium">{localPost.commentCount}</span>}
            <span>Comment</span>
          </button>

          <div className="ml-auto flex items-center gap-0.5">
            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${shareCopied ? "text-green-400 bg-green-500/10" : "text-[#71717A] hover:text-white hover:bg-white/5"}`}
            >
              {shareCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{shareCopied ? "Copied!" : "Share"}</span>
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${localPost.isSaved ? "text-yellow-400 bg-yellow-500/10" : "text-[#71717A] hover:text-white hover:bg-white/5"}`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${localPost.isSaved ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>

        {/* Comments */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5 overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {localPost.comments.length === 0 && (
                  <p className="text-[#4B4B52] text-xs text-center py-2">No comments yet. Start the discussion!</p>
                )}
                {localPost.comments.map(comment => (
                  <div key={comment.id} className="flex gap-2.5 group">
                    <Avatar className="w-7 h-7 border border-white/10 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-[#070707] text-white text-[10px]">{comment.user.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-white text-xs font-medium">{comment.user.fullName}</span>
                          <span className="text-[#4B4B52] text-[10px]">{comment.user.academicYear}</span>
                        </div>
                        {comment.user.id === currentUserId && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="opacity-0 group-hover:opacity-100 text-[#71717A] hover:text-red-400 transition-all p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-[#A1A1AA] text-xs leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {/* Comment input */}
                <div className="flex gap-2 pt-1">
                  <input
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                    placeholder="Add a comment…"
                    className="flex-1 bg-[#070707] border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#4B4B52] focus:outline-none focus:border-purple-500/50"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!commentInput.trim() || submittingComment}
                    size="icon"
                    className="bg-purple-600 hover:bg-purple-700 w-8 h-8 shrink-0 rounded-lg"
                  >
                    {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showReport && <ReportModal postId={post.id} onClose={() => setShowReport(false)} />}
        {showDelete && (
          <DeleteModal
            postId={post.id}
            onClose={() => setShowDelete(false)}
            onDeleted={() => onDelete(post.id)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const currentUserId = (session?.user as any)?.id ?? "";

  const [activeTab, setActiveTab] = useState("latest");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const fetchPosts = async (tab: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community?tab=${tab}`);
      if (res.ok) setPosts(await res.json());
    } catch { console.error("Failed to fetch posts"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(activeTab); }, [activeTab]);

  const handleSaved = (savedPost: Post) => {
    if (editingPost) {
      // Edit: update in place
      setPosts(prev => prev.map(p => p.id === savedPost.id ? { ...p, ...savedPost } : p));
    } else {
      // Create: prepend
      setPosts(prev => [savedPost as any, ...prev]);
    }
    setEditingPost(null);
  };

  const handleDelete = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div className="min-h-screen bg-[#070707]">

      {/* Sticky header with tabs */}
      <div className="border-b border-white/8 bg-[#070707]/95 backdrop-blur-md sticky top-[64px] z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="min-w-0">
              <h1 className="text-white font-bold text-lg sm:text-xl leading-none">Community</h1>
              <p className="text-[#71717A] text-xs mt-0.5 hidden sm:block">Academic discussions, resources &amp; opportunities</p>
            </div>
            <Button onClick={() => { setEditingPost(null); setShowCreateModal(true); }} className="bg-white text-black hover:bg-white/90 h-9 text-sm gap-1.5 shrink-0">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Post</span>
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 overflow-x-auto scrollbar-none -mx-4 px-4">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-all ${activeTab === id
                  ? "border-white text-white font-medium"
                  : "border-transparent text-[#71717A] hover:text-[#A1A1AA]"}`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#71717A]" />
            <p className="text-[#71717A] text-sm">Loading community posts…</p>
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-[#71717A]" />
            </div>
            <p className="text-white font-medium mb-1">No posts yet</p>
            <p className="text-[#71717A] text-sm max-w-xs">
              {activeTab === "saved" ? "You haven't saved any posts yet." : "Be the first to share something with the community!"}
            </p>
            {activeTab !== "saved" && (
              <Button onClick={() => setShowCreateModal(true)} className="mt-4 bg-white text-black hover:bg-white/90 h-9">
                <Plus className="w-4 h-4 mr-1.5" /> Create Post
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  onEdit={p => { setEditingPost(p); setShowCreateModal(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <PostFormModal
            onClose={() => { setShowCreateModal(false); setEditingPost(null); }}
            onSave={handleSaved}
            editingPost={editingPost}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

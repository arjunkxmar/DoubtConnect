"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, CheckCheck, Sparkles, MessageCircle, Trophy, 
  HelpCircle, ChevronRight, Loader2, Inbox, ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchNotifications();
    }
  }, [status, router]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIconForType = (type: string) => {
    switch (type) {
      case "MATCH":
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case "BEST_ANSWER":
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case "NEW_ANSWER":
        return <MessageCircle className="w-5 h-5 text-blue-400" />;
      default:
        return <HelpCircle className="w-5 h-5 text-emerald-400" />;
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-[#A1A1AA] text-sm mt-1 hidden sm:block">
            Real-time peer matches, responses to your questions, and reputation milestones.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs gap-2"
          >
            <CheckCheck className="w-3.5 h-3.5 text-purple-400" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "all"
              ? "bg-white/10 text-white"
              : "text-[#71717A] hover:text-white"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "unread"
              ? "bg-white/10 text-white"
              : "text-[#71717A] hover:text-white"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-white/5 bg-[#111111]/40 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-[#71717A]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {filter === "unread" ? "You're all caught up!" : "No notifications yet"}
          </h3>
          <p className="text-sm text-[#71717A] max-w-sm mx-auto">
            {filter === "unread"
              ? "Check back later or explore academic doubts to solve."
              : "When peers ask questions in your subjects or answer your doubts, they will appear here."}
          </p>
          <div className="mt-6">
            <Link href="/doubts">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                Explore Doubts
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((notification) => {
              const content = (
                <div
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    !notification.isRead
                      ? "bg-[#141414] border-purple-500/20 shadow-lg shadow-purple-500/5 hover:border-purple-500/40"
                      : "bg-[#111111]/60 border-white/5 hover:border-white/10 opacity-80 hover:opacity-100"
                  }`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0 mt-0.5">
                    {getIconForType(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                        {notification.type.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-[#71717A]">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm text-white leading-relaxed">
                      {notification.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                    )}
                    {notification.linkUrl && (
                      <ChevronRight className="w-4 h-4 text-[#71717A]" />
                    )}
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {notification.linkUrl ? (
                    <Link href={notification.linkUrl}>{content}</Link>
                  ) : (
                    content
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

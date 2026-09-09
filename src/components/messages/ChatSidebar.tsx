"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export function ChatSidebar({ activeId }: { activeId?: string }) {
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/messages")
      .then(res => res.json())
      .then(data => setConversations(data))
      .catch(console.error);
  }, []);

  return (
    <div className="w-full md:w-80 border-r border-white/10 bg-[#070707] flex flex-col h-[calc(100vh-64px)]">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full bg-[#111111] border border-white/10 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-[#71717A] text-sm">
            No conversations yet. Start a chat from the dashboard or doubt feed.
          </div>
        ) : conversations.map((conv) => (
          <Link href={`/messages/${conv.id}`} key={conv.id}>
            <div className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${activeId === conv.id ? 'bg-white/10' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarFallback className="bg-[#111111] text-white">{conv.user.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-white font-medium text-sm">{conv.user.name}</h3>
                    <p className="text-xs text-[#71717A]">{conv.user.academicYear} • {conv.user.branch}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-[#71717A]">
                    {formatDistanceToNow(new Date(conv.time), { addSuffix: true })}
                  </span>
                  {conv.unreadCount > 0 && (
                    <Badge className="bg-purple-600 text-white w-5 h-5 flex items-center justify-center p-0 rounded-full">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-[#A1A1AA] text-sm line-clamp-1 mt-2">
                {conv.lastMessage}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

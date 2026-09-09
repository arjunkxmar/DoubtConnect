"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Paperclip, Smile, Send, MoreVertical, Phone, Video, 
  HelpCircle, Share2, BookOpen, Compass, CheckCircle2 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

export function ChatWindow({ activeId }: { activeId: string }) {
  const [inputValue, setInputValue] = useState("");
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${activeId}`);
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // 5 sec poll
    return () => clearInterval(interval);
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    
    const content = inputValue;
    setInputValue(""); // optimistic clear
    
    // optimistic update
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content,
      sender: 'me',
      timestamp: new Date().toISOString(),
      read: false
    }]);

    try {
      await fetch(`/api/messages/${activeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex-1 flex justify-center items-center text-white">Loading...</div>;
  if (!conversation) return <div className="flex-1 flex justify-center items-center text-white">Conversation not found.</div>;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] bg-[#111111]/50 backdrop-blur-md">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-[#070707]/80 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-white/10">
            <AvatarFallback className="bg-[#111111] text-white">{conversation.user.avatar}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-white font-medium text-sm">{conversation.user.name}</h3>
            <p className="text-xs text-[#71717A] flex items-center gap-1">
              {conversation.user.academicYear} • {conversation.user.branch} 
              <span className="text-purple-400 cursor-pointer hover:underline ml-2">View Profile</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-[#A1A1AA] hover:text-white hover:bg-white/10"><Phone className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-[#A1A1AA] hover:text-white hover:bg-white/10"><Video className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-[#A1A1AA] hover:text-white hover:bg-white/10"><MoreVertical className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Academic Quick Actions */}
      <div className="bg-[#171717] p-2 border-b border-white/5 flex gap-2 overflow-x-auto custom-scrollbar whitespace-nowrap">
        <Button variant="outline" size="sm" className="bg-[#070707] border-white/10 text-[#A1A1AA] hover:text-white rounded-full text-xs h-8">
          <HelpCircle className="w-3 h-3 mr-1.5" /> Ask About Doubt
        </Button>
        <Button variant="outline" size="sm" className="bg-[#070707] border-white/10 text-[#A1A1AA] hover:text-white rounded-full text-xs h-8">
          <Share2 className="w-3 h-3 mr-1.5" /> Share Doubt
        </Button>
        <Button variant="outline" size="sm" className="bg-[#070707] border-white/10 text-[#A1A1AA] hover:text-white rounded-full text-xs h-8">
          <BookOpen className="w-3 h-3 mr-1.5" /> Share Resource
        </Button>
        <Button variant="outline" size="sm" className="bg-[#070707] border-white/10 text-[#A1A1AA] hover:text-white rounded-full text-xs h-8">
          <Compass className="w-3 h-3 mr-1.5" /> Ask for Guidance
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 flex flex-col">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col max-w-[70%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
            <div 
              className={`p-3 rounded-2xl ${msg.sender === 'me' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-white/10 text-[#E4E4E7] rounded-bl-sm border border-white/5'}`}
            >
              {msg.content}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-[#71717A]">
              <span>{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}</span>
              {msg.sender === 'me' && (
                <CheckCircle2 className={`w-3 h-3 ${msg.read ? 'text-blue-400' : 'text-[#71717A]'}`} />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-[#070707]">
        <div className="flex items-end gap-2 bg-[#111111] border border-white/10 rounded-xl p-2 focus-within:border-purple-500/50 transition-colors">
          <Button type="button" variant="ghost" size="icon" className="text-[#A1A1AA] hover:text-white hover:bg-white/5 h-10 w-10 shrink-0">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your academic question..." 
            className="flex-1 bg-transparent border-none text-white focus-visible:ring-0 px-0 placeholder:text-[#71717A]"
          />
          <Button type="button" variant="ghost" size="icon" className="text-[#A1A1AA] hover:text-white hover:bg-white/5 h-10 w-10 shrink-0">
            <Smile className="w-5 h-5" />
          </Button>
          <Button type="submit" size="icon" className="bg-purple-600 hover:bg-purple-700 text-white h-10 w-10 shrink-0 rounded-lg">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

import { ChatSidebar } from "@/components/messages/ChatSidebar";
import { MessageSquarePlus } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div className="w-full md:w-80 border-r border-white/10 shrink-0">
        <ChatSidebar />
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#111111] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <MessageSquarePlus className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
          <p className="text-[#A1A1AA] max-w-sm">
            Select a conversation or start a new one to get academic help.
          </p>
        </div>
      </div>
    </div>
  );
}

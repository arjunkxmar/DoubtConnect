import { ChatSidebar } from "@/components/messages/ChatSidebar";
import { ChatWindow } from "@/components/messages/ChatWindow";

export default function MessageDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div className="hidden md:block w-80 border-r border-white/10 shrink-0">
        <ChatSidebar activeId={params.id} />
      </div>
      <div className="flex-1 min-w-0">
        <ChatWindow activeId={params.id} />
      </div>
    </div>
  );
}

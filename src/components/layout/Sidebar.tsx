"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Home, 
  HelpCircle, 
  PlusCircle, 
  Users, 
  BookOpen, 
  Bot, 
  MessageSquare, 
  Bell, 
  User 
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const sidebarLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Doubts", href: "/doubts", icon: HelpCircle },
    { name: "Ask Doubt", href: "/ask-doubt", icon: PlusCircle },
    { name: "Community", href: "/community", icon: Users },
    { name: "Subjects", href: "/subjects", icon: BookOpen },
    { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] sticky top-16 border-r border-white/10 bg-[#070707] py-6 px-4">
      <nav className="flex flex-col gap-2 flex-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          
          return (
            <Link key={link.name} href={link.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-white/10 text-white font-medium" 
                    : "text-[#A1A1AA] hover:bg-[#111111] hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-[#71717A]"}`} />
                <span>{link.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 rounded-xl bg-gradient-to-b from-[#111111] to-[#070707] border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="h-5 w-5 text-purple-400" />
          <span className="font-semibold text-sm text-white">DoubtConnect AI</span>
        </div>
        <p className="text-xs text-[#A1A1AA] mb-3">
          Stuck on a problem? Ask our Gemini-powered AI tutor.
        </p>
        <Link href="/ai-assistant">
          <button className="w-full py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-white/90 transition-colors">
            Ask AI Now
          </button>
        </Link>
      </div>
    </aside>
  );
}

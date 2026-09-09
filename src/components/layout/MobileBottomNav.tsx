"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HelpCircle, PlusCircle, Users, BookOpen, Bot } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Don't show on landing, auth, or about pages
  const hiddenPaths = ["/", "/login", "/signup", "/about"];
  if (hiddenPaths.includes(pathname)) return null;

  const links = [
    { name: "Home", href: "/doubts", icon: Home },
    { name: "Community", href: "/community", icon: Users },
    { name: "Ask", href: "/ask-doubt", icon: PlusCircle, highlight: true },
    { name: "Subjects", href: "/subjects", icon: BookOpen },
    { name: "AI Tutor", href: "/ai-assistant", icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-white/10 bg-[#070707]/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          const Icon = link.icon;

          if (link.highlight) {
            return (
              <Link key={link.name} href={link.href} className="flex flex-col items-center justify-center -mt-5">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30 border-4 border-[#070707]">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] mt-0.5 text-purple-400 font-medium">{link.name}</span>
              </Link>
            );
          }

          return (
            <Link key={link.name} href={link.href} className="flex flex-col items-center justify-center gap-0.5 py-1 min-w-[56px]">
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#71717A]"}`} />
              <span className={`text-[10px] ${isActive ? "text-white font-medium" : "text-[#71717A]"}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

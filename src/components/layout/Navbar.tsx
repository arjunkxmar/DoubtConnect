"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Search, Sparkles, X, LogIn, LogOut, User as UserIcon, Settings, BookOpen, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/notifications")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            const unread = data.filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
          }
        })
        .catch(() => {});
    }
  }, [session, pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Doubts", href: "/doubts" },
    { name: "Community", href: "/community" },
    { name: "Subjects", href: "/subjects" },
    { name: "AI Tutor", href: "/ai-assistant" },
    { name: "About", href: "/about" },
  ];

  return (
    <motion.header 
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070707]/90 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
              DoubtConnect
            </span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-white px-2 py-1 rounded-md ${
                    isActive ? "text-white bg-white/5 font-semibold" : "text-[#A1A1AA]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex relative items-center">
            <Search className="absolute left-3 h-4 w-4 text-[#71717A]" />
            <input 
              type="text" 
              placeholder="Search doubts, subjects..." 
              className="h-9 w-60 rounded-full border border-white/10 bg-[#111111] pl-9 pr-4 text-xs text-white placeholder:text-[#71717A] focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>

          {session?.user ? (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-full">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-[#070707]" />
                  )}
                </Button>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-white/10 hover:border-white/20 transition-all bg-[#111111]"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-xs font-semibold">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-white font-medium pr-2 hidden sm:inline">
                    {session.user.name?.split(" ")[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#111111] p-2 shadow-2xl z-50"
                    >
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="text-sm font-semibold text-white truncate">{session.user.name}</p>
                        <p className="text-xs text-[#71717A] truncate">{session.user.email}</p>
                        {(session.user as any).points !== undefined && (
                          <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            ★ {(session.user as any).points} Points
                          </div>
                        )}
                      </div>
                      
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5" /> My Profile
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" /> Account Settings
                      </Link>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs text-[#A1A1AA] hover:text-white">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-[#A1A1AA] hover:text-white hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-white/10 bg-[#0c0c0c] px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar"
          >
            {/* Mobile Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
              <input 
                type="text" 
                placeholder="Search doubts, subjects..." 
                className="h-10 w-full rounded-xl border border-white/10 bg-[#111111] pl-9 pr-4 text-sm text-white placeholder:text-[#71717A] focus:border-purple-500/50 focus:outline-none"
              />
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t border-white/5 my-2" />

            {session?.user && (
              <>
                <Link
                  href="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5"
                >
                  <Menu className="w-4 h-4" /> Messages
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5"
                >
                  <span className="flex items-center gap-3">
                    <Bell className="w-4 h-4" /> Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5"
                >
                  <UserIcon className="w-4 h-4" /> Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5"
                >
                  <Settings className="w-4 h-4" /> Settings
                </Link>
              </>
            )}

            <div className="border-t border-white/5 my-2" />

            <Link
              href="/ask-doubt"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm text-white bg-purple-600 hover:bg-purple-700 font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Ask a Doubt
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

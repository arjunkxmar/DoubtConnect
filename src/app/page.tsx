"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen, Users, Bot } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { HeroScene } from "@/components/3d/HeroScene";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#070707] overflow-hidden selection:bg-white/20">
      <Navbar />
      <HeroScene />
      
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16 sm:pt-32 sm:pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-[#A1A1AA]">The Ultimate College EdTech Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-4 sm:mb-6 max-w-5xl"
        >
          Ask. Learn. Help. <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#71717A]">Grow.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl text-[#A1A1AA] mb-8 sm:mb-10 max-w-2xl px-4 sm:px-0"
        >
          Connect with peers and seniors, get academic doubts solved instantly with AI, and build your reputation on campus.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/doubts">
            <Button size="lg" className="h-14 px-8 text-lg bg-white text-black hover:bg-white/90 rounded-full">
              Explore Doubts
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 text-white hover:bg-white/5 hover:text-white rounded-full group">
              Join Community
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="mt-20 sm:mt-32 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl w-full"
        >
          {[
            { icon: BookOpen, title: "Peer Learning", desc: "Get help from seniors and batchmates who took the exact same courses." },
            { icon: Bot, title: "AI Assistance", desc: "Stuck at 2 AM? Our Gemini-powered AI tutor explains concepts step-by-step." },
            { icon: Users, title: "Build Reputation", desc: "Answer questions, earn points, and stand out in your college community." }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl border border-white/5 bg-[#111111]/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-[#A1A1AA]">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
      
      {/* Background gradients for cinematic feel */}
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}

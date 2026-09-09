"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Sparkles, Users, Bot, Trophy, ArrowRight, BookOpen, 
  ShieldCheck, Zap, HeartHandshake, CheckCircle2, GraduationCap 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const features = [
    {
      icon: Users,
      title: "Smart Peer Matching",
      description: "Our matching engine routes your doubts to batchmates and seniors who excelled in the exact same university courses, ensuring authentic, course-aligned help.",
      color: "from-blue-500/20 to-cyan-500/10",
      iconColor: "text-blue-400",
    },
    {
      icon: Bot,
      title: "24/7 Gemini AI Academic Tutor",
      description: "Stuck at 2 AM before an exam? Ask our AI tutor for Socratic step-by-step derivations, code explanations, and concept breakdowns with instant response.",
      color: "from-purple-500/20 to-pink-500/10",
      iconColor: "text-purple-400",
    },
    {
      icon: Trophy,
      title: "Gamified Campus Reputation",
      description: "Give back to your college community. Earn contribution points, unlock Mentor badges, and showcase your verified academic expertise to peers.",
      color: "from-amber-500/20 to-yellow-500/10",
      iconColor: "text-amber-400",
    },
    {
      icon: BookOpen,
      title: "Campus Knowledge Commons",
      description: "Access end-sem revision notes, formula cheat sheets, hackathon teammate requests, and placement preparation tips curated by fellow students.",
      color: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-400",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Post Your Doubt",
      desc: "Specify subject, topic, and tags. Attach code, equations, or screenshots of problem statements.",
    },
    {
      num: "02",
      title: "Matched with Seniors & AI",
      desc: "Our matching algorithm notifies qualified campus peers while our AI tutor prepares an instant breakdown.",
    },
    {
      num: "03",
      title: "Learn, Upvote & Reward",
      desc: "Choose the best solution, reward points to helpful contributors, and build campus collaboration.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
        
        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Next-Generation University Academic Community</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              No Student Left Behind. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400">
                Peer Wisdom Powered by AI.
              </span>
            </h1>

            <p className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto mb-10 leading-relaxed">
              DoubtConnect bridges the gap between students, seniors, and course syllabi. 
              Get clear answers to difficult engineering & academic doubts, build meaningful peer mentorships, and master your subjects.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button className="w-full sm:w-auto h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 gap-2">
                  Join Campus Community <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/doubts">
                <Button variant="outline" className="w-full sm:w-auto h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl">
                  Explore Questions
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pillars / Feature Grid */}
      <section className="py-20 border-b border-white/10 bg-[#0a0a0a]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Why DoubtConnect?
            </h2>
            <p className="text-sm text-[#A1A1AA] max-w-xl mx-auto">
              Traditional classroom Q&A and generic forums fall short for college-specific courses. Here is how we make academic collaboration seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-8 rounded-3xl border border-white/10 bg-gradient-to-br ${feat.color} backdrop-blur-xl shadow-xl hover:border-white/20 transition-all`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 ${feat.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              How It Works
            </h2>
            <p className="text-sm text-[#A1A1AA]">
              From asking a doubt to receiving a verified explanation in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, idx) => (
              <div
                key={s.num}
                className="p-6 rounded-2xl bg-[#111111]/60 border border-white/10 relative"
              >
                <div className="text-3xl font-black text-purple-500/40 mb-4">
                  {s.num}
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="p-12 rounded-3xl bg-gradient-to-r from-purple-900/50 via-[#161224] to-[#111111] border border-purple-500/30 backdrop-blur-xl shadow-2xl">
            <GraduationCap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3">
              Ready to Accelerate Your Learning?
            </h2>
            <p className="text-sm text-[#A1A1AA] max-w-md mx-auto mb-8">
              Join thousands of college students asking, learning, and answering academic doubts daily.
            </p>
            <Link href="/signup">
              <Button className="h-12 px-8 bg-white text-black hover:bg-white/90 font-semibold rounded-xl">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

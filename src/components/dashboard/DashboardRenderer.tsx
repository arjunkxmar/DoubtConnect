"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bot, HelpCircle, Users, BookOpen, BrainCircuit, Rocket, Briefcase, 
  MessagesSquare, TrendingUp, Sparkles, MessageCircle, Trophy, MessageSquare
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardRendererProps {
  user: any;
  year: string;
  topSeniors: any[];
}

export function DashboardRenderer({ user, year, topSeniors }: DashboardRendererProps) {
  const router = useRouter();

  const handleMessage = async (targetUserId: string) => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId })
      });
      if (res.ok) {
        const conv = await res.json();
        router.push(`/messages/${conv.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };
  // Common Sections
  const Greeting = () => (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">Good Morning, {user.name} 👋</h1>
      <p className="text-[#A1A1AA]">Every doubt is a step toward learning.</p>
    </div>
  );

  // Dynamic Action Buttons
  const getQuickActions = () => {
    switch(year) {
      case "1st Year":
        return [
          { label: "Ask Doubt", icon: HelpCircle, href: "/ask-doubt", primary: true },
          { label: "Ask Senior", icon: Users, href: "/community", primary: false },
          { label: "AI Assistant", icon: Bot, href: "/ai-assistant", primary: false },
        ];
      case "2nd Year":
        return [
          { label: "Ask Senior", icon: Users, href: "/community", primary: true },
          { label: "Help Juniors", icon: MessagesSquare, href: "/doubts", primary: false },
          { label: "Projects", icon: Rocket, href: "/community", primary: false },
        ];
      case "3rd Year":
        return [
          { label: "Help Juniors", icon: MessagesSquare, href: "/doubts", primary: true },
          { label: "Tech Prep", icon: BrainCircuit, href: "/subjects", primary: false },
          { label: "Peer Learning", icon: Users, href: "/community", primary: false },
        ];
      case "4th Year":
        return [
          { label: "Mentor Juniors", icon: Trophy, href: "/doubts", primary: true },
          { label: "Advanced Doubts", icon: HelpCircle, href: "/doubts", primary: false },
          { label: "Career Info", icon: Briefcase, href: "/community", primary: false },
        ];
      default:
        return [
          { label: "Ask Doubt", icon: HelpCircle, href: "/ask-doubt", primary: true },
          { label: "Community", icon: Users, href: "/community", primary: false },
        ];
    }
  };

  const getPrioritySections = () => {
    // Return order of section component keys
    if (year === "1st Year") return ['recommended', 'ai', 'subjects', 'canHelp'];
    if (year === "2nd Year") return ['canHelp', 'recommended', 'subjects', 'ai'];
    if (year === "3rd Year") return ['canHelp', 'projects', 'subjects', 'recommended'];
    if (year === "4th Year") return ['mentor', 'career', 'canHelp', 'community'];
    return ['recommended', 'canHelp', 'ai', 'subjects'];
  };

  const priorityKeys = getPrioritySections();

  return (
    <div className="space-y-6">
      <Greeting />

      {/* Quick Actions Array */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {getQuickActions().map((action, i) => (
          <Link href={action.href} key={i}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className={`w-full h-14 flex items-center justify-start gap-3 px-4 ${
                  action.primary 
                    ? "bg-white text-black hover:bg-white/90" 
                    : "bg-[#111111] text-white border border-white/10 hover:bg-[#171717]"
                }`}
              >
                <action.icon className={`w-5 h-5 ${action.primary ? "text-black" : "text-[#A1A1AA]"}`} />
                <span className="font-semibold">{action.label}</span>
              </Button>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Dynamic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Feed Column (Takes 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {priorityKeys.map((key, index) => {
            if (key === 'seniors') return (
              <Card key={key} className="bg-[#111111]/80 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" /> Top Seniors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topSeniors.map((senior) => (
                    <div key={senior.id} className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-white/10">
                          <AvatarFallback className="bg-[#111111] text-white">{senior.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium text-sm">{senior.fullName}</p>
                          <p className="text-xs text-[#71717A]">{senior.academicYear} • {senior.branch}</p>
                        </div>
                      </div>
                      <Button onClick={() => handleMessage(senior.id)} variant="outline" size="sm" className="bg-[#070707] border-white/10 text-white hover:bg-white/20 h-8">
                        <MessageSquare className="w-3 h-3 mr-1.5" /> Message
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
            if (key === 'recommended') return (
              <Card key={key} className="bg-[#111111]/80 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" /> Recommended Doubts
                  </CardTitle>
                  <CardDescription className="text-[#A1A1AA]">Curated for your {year} syllabus</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#070707] border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                    <h4 className="text-white font-medium mb-2">How does Dijkstra's algorithm handle negative weights?</h4>
                    <div className="flex items-center justify-between text-xs text-[#71717A]">
                      <span className="bg-white/5 px-2 py-1 rounded-md text-[#A1A1AA]">Data Structures</span>
                      <span>Asked 2h ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            if (key === 'canHelp' || key === 'mentor') return (
              <Card key={key} className="bg-[#111111]/80 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" /> {key === 'mentor' ? "Mentor Juniors" : "Doubts You Can Help With"}
                  </CardTitle>
                  <CardDescription className="text-[#A1A1AA]">Boost your contribution points by answering these</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#070707] border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                    <h4 className="text-white font-medium mb-2">What is the difference between Array and LinkedList?</h4>
                    <div className="flex items-center justify-between text-xs text-[#71717A]">
                      <span className="bg-white/5 px-2 py-1 rounded-md text-[#A1A1AA]">Programming 101</span>
                      <span>Asked by 1st Year</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            if (key === 'ai') return (
              <Card key={key} className="bg-gradient-to-br from-[#111111] to-[#1a1128] border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-400" /> AI Assistant
                  </CardTitle>
                  <CardDescription className="text-[#A1A1AA]">Get instant step-by-step explanations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <input type="text" placeholder="Ask Gemini about any concept..." className="w-full bg-[#070707] border border-white/10 rounded-xl h-12 pl-4 pr-12 text-white focus:outline-none focus:border-purple-500/50" />
                    <Button size="icon" className="absolute right-1 top-1 h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
            return null; // Add other dynamic sections as needed
          })}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card className="bg-[#111111]/80 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Contribution Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[#A1A1AA] text-sm">Rank</span>
                <span className="text-white font-semibold px-2 py-1 bg-white/10 rounded-lg text-xs">Learner</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#A1A1AA] text-sm">Points</span>
                <span className="text-white font-semibold">{user.points || 0}</span>
              </div>
              <div className="w-full bg-[#171717] h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full w-1/3 rounded-full" />
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 text-center">
                <Link href="/profile" className="text-xs text-white hover:underline">View Full Profile →</Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111]/80 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" /> Community Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-green-400" />
                <p className="text-[#A1A1AA]"><span className="text-white">Rahul</span> reached Mentor rank in CS department!</p>
              </div>
              <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400" />
                <p className="text-[#A1A1AA]"><span className="text-white">New Resource:</span> Complete guide to System Design uploaded.</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

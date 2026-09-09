import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, MessageCircle, HelpCircle, ThumbsUp, Zap } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          doubts: true,
          answers: true,
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Calculate Contribution Level
  let level = "Beginner";
  let progress = (user.points / 50) * 100;
  if (user.points >= 50) { level = "Learner"; progress = ((user.points - 50) / 100) * 100; }
  if (user.points >= 150) { level = "Contributor"; progress = ((user.points - 150) / 250) * 100; }
  if (user.points >= 400) { level = "Mentor"; progress = 100; }
  
  progress = Math.min(Math.max(progress, 0), 100);

  // Mock complex stats for now until db is heavily populated
  const doubtsSolved = Math.floor(user._count.answers * 0.4);
  const bestAnswers = Math.floor(user._count.answers * 0.2);
  const helpfulVotes = user.points * 2;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-[#111111]/80 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 border-2 border-white/10 mb-4">
                <AvatarFallback className="text-3xl bg-[#171717]">{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-white mb-1">{user.fullName}</h2>
              <p className="text-[#A1A1AA] text-sm mb-4">{user.college}</p>
              
              <div className="w-full space-y-3 text-left border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs text-[#71717A] uppercase font-semibold">Branch</p>
                  <p className="text-white text-sm">{user.branch}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] uppercase font-semibold">Academic Year</p>
                  <p className="text-white text-sm">{user.academicYear}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111]/80 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg text-white">Tags & Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-[#71717A] uppercase font-semibold mb-2">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {user.subjects.split(',').map(s => s.trim()).filter(Boolean).map(subject => (
                    <Badge key={subject} variant="outline" className="border-white/10 text-[#A1A1AA]">{subject}</Badge>
                  ))}
                  {!user.subjects && <span className="text-sm text-[#71717A]">No subjects added</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-[#71717A] uppercase font-semibold mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {user.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-white/5 text-white hover:bg-white/10">{skill}</Badge>
                  ))}
                  {!user.skills && <span className="text-sm text-[#71717A]">No skills added</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Statistics & Contribution */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#111111]/80 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Trophy className="w-32 h-32 text-white" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl text-white">Contribution Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 mb-4 relative z-10">
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A1A1AA]">
                  {level}
                </span>
                <span className="text-[#71717A] mb-1">{user.points} Points</span>
              </div>
              <div className="h-3 w-full bg-[#171717] rounded-full overflow-hidden relative z-10">
                <div 
                  className="h-full bg-gradient-to-r from-white to-gray-400 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-[#71717A] mt-3 relative z-10">
                {level === "Mentor" ? "You've reached the highest rank!" : "Keep answering and asking doubts to reach the next level."}
              </p>
            </CardContent>
          </Card>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">Your Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Doubts Asked", value: user._count.doubts, icon: HelpCircle },
              { label: "Answers Given", value: user._count.answers, icon: MessageCircle },
              { label: "Doubts Solved", value: doubtsSolved, icon: Zap },
              { label: "Best Answers", value: bestAnswers, icon: Star },
              { label: "Helpful Votes", value: helpfulVotes, icon: ThumbsUp },
              { label: "Contributions", value: user._count.doubts + user._count.answers, icon: Trophy },
            ].map((stat, i) => (
              <Card key={i} className="bg-[#111111]/80 border-white/10 backdrop-blur-xl shadow-2xl hover:-translate-y-1 transition-transform duration-300">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <stat.icon className="w-8 h-8 text-[#A1A1AA] mb-3" />
                  <span className="text-3xl font-bold text-white mb-1">{stat.value}</span>
                  <span className="text-xs text-[#71717A] uppercase">{stat.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

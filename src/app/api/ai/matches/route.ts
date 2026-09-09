import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// In-memory scoring — mirrors matching.ts but works without a persisted doubt
function scoreUser(user: any, context: {
  subject: string;
  topic: string;
  tags: string[];
  authorYear: number;
}): number {
  let score = 0;
  const userSubjects = (user.subjects ?? "").toLowerCase();
  const userSkills = (user.skills ?? "").toLowerCase();
  const subject = context.subject.toLowerCase();
  const topic = context.topic.toLowerCase();

  // 1. Subject match (+30)
  if (userSubjects.includes(subject) || subject.includes(userSubjects)) {
    score += 30;
  }

  // 2. Topic / tag match (+20)
  let topicHit = userSkills.includes(topic) || userSubjects.includes(topic);
  context.tags.forEach(tag => {
    if (userSkills.includes(tag) || userSubjects.includes(tag)) topicHit = true;
  });
  if (topicHit) score += 20;

  // 3. Seniority bonus (+10)
  const yearMap: Record<string, number> = {
    "1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4,
  };
  const helperYear = yearMap[user.academicYear] ?? 1;
  if (helperYear > context.authorYear) score += 10;

  // 4. Contribution proxy (+up to 20)
  score += Math.min(20, Math.floor(user.points / 10));

  return score;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const { subject = "", topic = "", tags = [] } = body;

    if (!subject) {
      return NextResponse.json({ matches: [] });
    }

    // Fetch current user for year info
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { academicYear: true },
    });
    const yearMap: Record<string, number> = {
      "1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4,
    };
    const authorYear = yearMap[currentUser?.academicYear ?? "1st Year"] ?? 1;

    // Fetch all other users
    const users = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: {
        id: true, fullName: true, academicYear: true,
        branch: true, subjects: true, skills: true, points: true,
      },
    });

    const tagList = Array.isArray(tags)
      ? tags.map((t: string) => t.toLowerCase().trim())
      : String(tags).toLowerCase().split(",").map((t: string) => t.trim());

    const scored = users
      .map((user: any) => ({ user, score: scoreUser(user, { subject, topic, tags: tagList, authorYear }) }))
      .filter(({ score }: { score: number }) => score >= 20) // lower threshold for AI context (no full doubt)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 4);

    const matches = scored.map(({ user, score }: { user: any; score: number }) => ({
      id: user.id,
      name: user.fullName,
      academicYear: user.academicYear,
      branch: user.branch,
      skills: user.skills,
      points: user.points,
      score,
    }));

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("AI_MATCHES_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";

export async function findMatchesForDoubt(doubtId: string) {
  // Fetch the doubt and its author
  const doubt = await prisma.doubt.findUnique({
    where: { id: doubtId },
    include: { author: true }
  });

  if (!doubt) return 0;

  // Fetch all active users EXCEPT the author
  const users = await prisma.user.findMany({
    where: {
      id: { not: doubt.authorId }
    }
  });

  const doubtTags = doubt.tags.toLowerCase().split(',').map(t => t.trim());
  const doubtTopic = doubt.topic.toLowerCase();
  const doubtSubject = doubt.subject.toLowerCase();
  
  const matches = users.map(user => {
    let score = 0;
    const userSubjects = user.subjects.toLowerCase();
    const userSkills = user.skills.toLowerCase();

    // 1. Subject Match (High: +30)
    if (userSubjects.includes(doubtSubject) || doubtSubject.includes(userSubjects)) {
      score += 30;
    }

    // 2. Topic/Tag Match (High: +20)
    let tagMatch = false;
    doubtTags.forEach(tag => {
      if (userSkills.includes(tag) || userSubjects.includes(tag) || tag.includes(doubtTopic)) {
        tagMatch = true;
      }
    });
    if (tagMatch || userSkills.includes(doubtTopic)) {
      score += 20;
    }

    // 3. Seniority Bonus (+10)
    const yearMap: Record<string, number> = {
      "1st Year": 1,
      "2nd Year": 2,
      "3rd Year": 3,
      "4th Year": 4
    };
    const authorYear = yearMap[doubt.author.academicYear] || 1;
    const helperYear = yearMap[user.academicYear] || 1;
    
    if (helperYear > authorYear) {
      score += 10;
    }

    // 4. Previous helpful answers (Points proxy: up to +20)
    const pointsBonus = Math.min(20, Math.floor(user.points / 10));
    score += pointsBonus;

    return { userId: user.id, score };
  });

  // Filter users who passed the threshold and sort by score
  const threshold = 40;
  const topMatches = matches
    .filter(m => m.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Take top 3

  // Create notifications for matched users
  for (const match of topMatches) {
    await prisma.notification.create({
      data: {
        userId: match.userId,
        type: "MATCH",
        message: `New Doubt You Can Help With in ${doubt.subject}: ${doubt.title}`,
        linkUrl: `/doubts/${doubt.id}`
      }
    });
  }

  return topMatches.length; // Returns how many students were notified
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return new NextResponse("Answer content is required", { status: 400 });
    }

    let userId = (session.user as any).id;
    let userName = session.user.name || "A Senior";

    if (!userId && session.user.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (dbUser) {
        userId = dbUser.id;
        userName = dbUser.fullName || userName;
      }
    }

    if (!userId) {
      return new NextResponse("User profile not found. Please log in again.", { status: 401 });
    }

    const answer = await prisma.answer.create({
      data: {
        content: content.trim(),
        doubtId: resolvedParams.id,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, fullName: true, academicYear: true, points: true } },
        _count: { select: { votes: true } }
      }
    });

    // Award 5 contribution points to senior/helper for providing an answer
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: 5 } }
    });

    // Notify doubt author
    const doubt = await prisma.doubt.findUnique({ where: { id: resolvedParams.id } });
    if (doubt && doubt.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: doubt.authorId,
          type: "NEW_ANSWER",
          message: `${userName} answered your doubt: ${doubt.title}`,
          linkUrl: `/doubts/${doubt.id}`
        }
      });
    }

    return NextResponse.json(answer);
  } catch (error) {
    console.error("ANSWER_CREATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

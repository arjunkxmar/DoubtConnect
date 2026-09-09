import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string, answerId: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;

    const doubt = await prisma.doubt.findUnique({
      where: { id: resolvedParams.id },
      include: { answers: true }
    });

    if (!doubt) return new NextResponse("Not Found", { status: 404 });
    if (doubt.authorId !== userId) return new NextResponse("Forbidden", { status: 403 });

    // Mark doubt as resolved and mark answer as best
    await prisma.$transaction([
      prisma.doubt.update({
        where: { id: resolvedParams.id },
        data: { isResolved: true }
      }),
      prisma.answer.updateMany({
        where: { doubtId: resolvedParams.id },
        data: { isBest: false } // Reset others
      }),
      prisma.answer.update({
        where: { id: resolvedParams.answerId },
        data: { isBest: true }
      })
    ]);

    // Find the author of the best answer to reward them
    const bestAnswer = doubt.answers.find((a: any) => a.id === resolvedParams.answerId);
    if (bestAnswer && bestAnswer.authorId !== userId) {
      await prisma.user.update({
        where: { id: bestAnswer.authorId },
        data: { points: { increment: 20 } }
      });

      // Notify the helper
      await prisma.notification.create({
        data: {
          userId: bestAnswer.authorId,
          type: "BEST_ANSWER",
          message: `Your answer was marked as Best! You earned 20 points.`,
          linkUrl: `/doubts/${doubt.id}`
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BEST_ANSWER_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

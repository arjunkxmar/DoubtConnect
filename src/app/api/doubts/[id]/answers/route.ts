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

    const answer = await prisma.answer.create({
      data: {
        content,
        doubtId: resolvedParams.id,
        authorId: (session.user as any).id,
      }
    });

    // Notify doubt author
    const doubt = await prisma.doubt.findUnique({ where: { id: resolvedParams.id } });
    if (doubt && doubt.authorId !== (session.user as any).id) {
      await prisma.notification.create({
        data: {
          userId: doubt.authorId,
          type: "NEW_ANSWER",
          message: `${(session.user as any).name} answered your doubt: ${doubt.title}`,
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

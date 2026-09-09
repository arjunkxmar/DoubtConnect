import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/community/[id]/report — report a post (once per user per post)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
    const userId = (session.user as any).id;

    const body = await req.json();
    const { reason = "Inappropriate content" } = body;

    const existing = await prisma.postReport.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existing) {
      return NextResponse.json({ reported: true, alreadyReported: true });
    }

    await prisma.postReport.create({ data: { userId, postId, reason } });
    return NextResponse.json({ reported: true });
  } catch (error) {
    console.error("REPORT_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

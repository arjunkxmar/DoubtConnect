import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/community/[id]/save — toggle save
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
    const userId = (session.user as any).id;

    const existing = await prisma.postSave.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existing) {
      await prisma.postSave.delete({ where: { userId_postId: { userId, postId } } });
      return NextResponse.json({ saved: false });
    } else {
      await prisma.postSave.create({ data: { userId, postId } });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error("SAVE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

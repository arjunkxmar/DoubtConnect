import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/community/[id]/like — toggle like + notification
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
    const userId = (session.user as any).id;

    const existing = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existing) {
      await prisma.postLike.delete({ where: { userId_postId: { userId, postId } } });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.postLike.create({ data: { userId, postId } });

      // Notify post author (not self)
      const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
      if (post && post.authorId !== userId) {
        const liker = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
        await prisma.notification.create({
          data: {
            type: "LIKE",
            message: `${liker?.fullName} found your community post helpful.`,
            linkUrl: `/community`,
            userId: post.authorId
          }
        });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("LIKE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

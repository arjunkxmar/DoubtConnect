import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/community/[id]/comment — add comment + notification
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
    const userId = (session.user as any).id;

    const body = await req.json();
    const { content } = body;
    if (!content?.trim()) return new NextResponse("Content required", { status: 400 });

    const comment = await prisma.postComment.create({
      data: { content: content.trim(), userId, postId },
      include: { user: { select: { id: true, fullName: true, academicYear: true } } }
    });

    // Notify post author (not self)
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (post && post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          message: `${comment.user.fullName} commented on your community post.`,
          linkUrl: `/community`,
          userId: post.authorId
        }
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("COMMENT_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/community/[id]/comment — delete own comment
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await params; // postId not used, commentId is in body
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
    const userId = (session.user as any).id;

    const body = await req.json();
    const { commentId } = body;
    if (!commentId) return new NextResponse("commentId required", { status: 400 });

    const comment = await prisma.postComment.findUnique({ where: { id: commentId } });
    if (!comment) return new NextResponse("Not Found", { status: 404 });
    if (comment.userId !== userId) return new NextResponse("Forbidden", { status: 403 });

    await prisma.postComment.delete({ where: { id: commentId } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("COMMENT_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

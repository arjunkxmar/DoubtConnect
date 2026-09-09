import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const POST_INCLUDE = (userId: string) => ({
  author: {
    select: { id: true, fullName: true, academicYear: true, branch: true, college: true }
  },
  _count: { select: { likes: true, comments: true } },
  likes: { where: { userId }, select: { id: true } },
  saves: { where: { userId }, select: { id: true } },
  reports: { where: { userId }, select: { id: true } },
  comments: {
    orderBy: { createdAt: "asc" as const },
    include: {
      user: { select: { id: true, fullName: true, academicYear: true } }
    }
  }
});

function formatPost(p: any) {
  return {
    id: p.id,
    type: p.type,
    title: p.title,
    content: p.content,
    tags: p.tags ? p.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    subject: p.subject,
    imageUrl: p.imageUrl,
    author: p.author,
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    isLiked: p.likes.length > 0,
    isSaved: p.saves.length > 0,
    isReported: p.reports.length > 0,
    comments: p.comments.map((c: any) => ({
      id: c.id,
      content: c.content,
      user: c.user,
      createdAt: c.createdAt
    })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// PATCH /api/community/[id] — edit own post
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
    const userId = (session.user as any).id;

    // Ownership check
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return new NextResponse("Not Found", { status: 404 });
    if (post.authorId !== userId) return new NextResponse("Forbidden", { status: 403 });

    const body = await req.json();
    const { title, content, tags, subject, type, imageUrl } = body;

    if (!content?.trim()) return new NextResponse("Content required", { status: 400 });

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        type: type || post.type,
        title: title?.trim() ?? post.title,
        content: content.trim(),
        tags: Array.isArray(tags) ? tags.join(", ") : (tags ?? post.tags),
        subject: subject ?? post.subject,
        imageUrl: imageUrl?.trim() ?? post.imageUrl,
      },
      include: POST_INCLUDE(userId)
    });

    return NextResponse.json(formatPost(updated));
  } catch (error) {
    console.error("COMMUNITY_PATCH_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/community/[id] — delete own post
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
    const userId = (session.user as any).id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return new NextResponse("Not Found", { status: 404 });
    if (post.authorId !== userId) return new NextResponse("Forbidden", { status: 403 });

    await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("COMMUNITY_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


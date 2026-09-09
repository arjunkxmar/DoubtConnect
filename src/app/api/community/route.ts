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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "latest";

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { college: true, branch: true, subjects: true }
    });

    let where: any = {};
    let orderBy: any = { createdAt: "desc" };

    if (tab === "my-college" && currentUser?.college) {
      where.college = currentUser.college;
    } else if (tab === "my-branch" && currentUser?.branch) {
      where.branch = currentUser.branch;
    } else if (tab === "my-subjects" && currentUser?.subjects) {
      const subjects = currentUser.subjects.split(",").map((s: string) => s.trim()).filter(Boolean);
      where.OR = subjects.map((s: string) => ({ subject: { contains: s } }));
    } else if (tab === "saved") {
      where.saves = { some: { userId } };
    } else if (tab === "trending") {
      where.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    }

    const posts = await prisma.post.findMany({
      where,
      include: POST_INCLUDE(userId),
      orderBy,
      take: 30
    });

    const sorted = tab === "trending"
      ? [...posts].sort((a, b) => b._count.likes - a._count.likes)
      : posts;

    const formatted = sorted.map(p => ({
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
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("COMMUNITY_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const { type, title, content, tags, subject, imageUrl } = body;

    if (!content?.trim()) return new NextResponse("Content required", { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { college: true, branch: true }
    });

    const post = await prisma.post.create({
      data: {
        type: type || "discussion",
        title: title?.trim() || null,
        content: content.trim(),
        tags: Array.isArray(tags) ? tags.join(", ") : (tags || ""),
        subject: subject || null,
        imageUrl: imageUrl?.trim() || null,
        college: user?.college || null,
        branch: user?.branch || null,
        authorId: userId
      },
      include: POST_INCLUDE(userId)
    });

    // Return formatted response matching GET shape
    const formatted = {
      id: post.id,
      type: post.type,
      title: post.title,
      content: post.content,
      tags: post.tags ? post.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      subject: post.subject,
      imageUrl: post.imageUrl,
      author: post.author,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      isLiked: post.likes.length > 0,
      isSaved: post.saves.length > 0,
      isReported: post.reports.length > 0,
      comments: post.comments.map((c: any) => ({
        id: c.id,
        content: c.content,
        user: c.user,
        createdAt: c.createdAt
      })),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("COMMUNITY_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

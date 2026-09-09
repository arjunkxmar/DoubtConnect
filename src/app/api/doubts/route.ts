import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findMatchesForDoubt } from "@/lib/matching";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { title, description, subject, topic, targetYear, tags, attachmentUrl } = body;

    const doubt = await prisma.doubt.create({
      data: {
        title,
        description,
        subject,
        topic,
        targetYear,
        tags,
        attachmentUrl,
        authorId: (session.user as any).id,
      }
    });

    // Run matching engine asynchronously so we don't block the response
    findMatchesForDoubt(doubt.id).catch(console.error);

    return NextResponse.json(doubt);
  } catch (error) {
    console.error("DOUBT_CREATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const subject = searchParams.get("subject");

    let whereClause: any = {};

    if (filter === "solved") whereClause.isResolved = true;
    if (filter === "unsolved") whereClause.isResolved = false;
    if (subject) whereClause.subject = { contains: subject };

    const doubts = await prisma.doubt.findMany({
      where: whereClause,
      include: {
        author: { select: { fullName: true, academicYear: true, branch: true } },
        _count: { select: { answers: true, votes: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(doubts);
  } catch (error) {
    console.error("DOUBTS_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

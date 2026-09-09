import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const doubt = await prisma.doubt.findUnique({
      where: { id: resolvedParams.id },
      include: {
        author: { select: { id: true, fullName: true, academicYear: true, branch: true } },
        answers: {
          include: {
            author: { select: { id: true, fullName: true, academicYear: true, points: true } },
            _count: { select: { votes: true } }
          },
          orderBy: [
            { isBest: "desc" },
            { createdAt: "asc" }
          ]
        },
        _count: { select: { votes: true } }
      }
    });

    if (!doubt) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(doubt);
  } catch (error) {
    console.error("DOUBT_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

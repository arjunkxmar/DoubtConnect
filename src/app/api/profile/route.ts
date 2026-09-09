import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        college: true,
        branch: true,
        academicYear: true,
        subjects: true,
        skills: true,
        points: true,
        createdAt: true,
        _count: {
          select: {
            doubts: true,
            answers: true,
          }
        }
      }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    console.error("PROFILE_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
    const userId = (session.user as any).id;

    const body = await req.json();
    const { fullName, college, branch, academicYear, subjects, skills } = body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName: fullName.trim() }),
        ...(college && { college: college.trim() }),
        ...(branch && { branch: branch.trim() }),
        ...(academicYear && { academicYear: academicYear.trim() }),
        ...(subjects !== undefined && {
          subjects: Array.isArray(subjects) ? subjects.join(", ") : subjects
        }),
        ...(skills !== undefined && {
          skills: Array.isArray(skills) ? skills.join(", ") : skills
        }),
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PROFILE_PATCH_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

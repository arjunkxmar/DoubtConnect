import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("NOTIFICATIONS_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
    const userId = (session.user as any).id;

    const body = await req.json();
    const { id, all } = body;

    if (all) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true, updated: "all" });
    }

    if (id) {
      const notification = await prisma.notification.findUnique({ where: { id } });
      if (!notification || notification.userId !== userId) {
        return new NextResponse("Not Found", { status: 404 });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });
      return NextResponse.json(updated);
    }

    return new NextResponse("Invalid request", { status: 400 });
  } catch (error) {
    console.error("NOTIFICATIONS_PATCH_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;

    // Fetch conversation to verify participation
    const conversation = await prisma.conversation.findUnique({
      where: { id: resolvedParams.id },
      include: {
        participants: { select: { id: true, fullName: true, academicYear: true, branch: true } }
      }
    });

    if (!conversation) return new NextResponse("Not Found", { status: 404 });
    if (!conversation.participants.some(p => p.id === userId)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Mark unread as read
    await prisma.message.updateMany({
      where: {
        conversationId: resolvedParams.id,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { conversationId: resolvedParams.id },
      orderBy: { createdAt: "asc" }
    });

    const otherUser = conversation.participants.find(p => p.id !== userId) || conversation.participants[0];

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        user: {
          id: otherUser.id,
          name: otherUser.fullName,
          academicYear: otherUser.academicYear,
          branch: otherUser.branch,
          avatar: otherUser.fullName.charAt(0)
        }
      },
      messages: messages.map(m => ({
        id: m.id,
        content: m.content,
        sender: m.senderId === userId ? 'me' : 'them',
        timestamp: m.createdAt,
        read: m.isRead
      }))
    });
  } catch (error) {
    console.error("GET /api/messages/[id]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const { content } = body;

    if (!content) return new NextResponse("Content required", { status: 400 });

    const conversation = await prisma.conversation.findUnique({
      where: { id: resolvedParams.id },
      include: { participants: true }
    });

    if (!conversation) return new NextResponse("Not Found", { status: 404 });
    if (!conversation.participants.some(p => p.id === userId)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Create message and update conversation
    const message = await prisma.$transaction([
      prisma.message.create({
        data: {
          content,
          senderId: userId,
          conversationId: resolvedParams.id
        }
      }),
      prisma.conversation.update({
        where: { id: resolvedParams.id },
        data: { updatedAt: new Date() }
      })
    ]);

    // Send notification to the other user
    const otherUser = conversation.participants.find(p => p.id !== userId);
    if (otherUser) {
      await prisma.notification.create({
        data: {
          type: "MESSAGE",
          message: `${(session.user as any).name} sent you a message.`,
          linkUrl: `/messages/${resolvedParams.id}`,
          userId: otherUser.id
        }
      });
    }

    return NextResponse.json(message[0]);
  } catch (error) {
    console.error("POST /api/messages/[id]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

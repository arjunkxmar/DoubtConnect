import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId }
        }
      },
      include: {
        participants: {
          select: { id: true, fullName: true, academicYear: true, branch: true }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    // Format for frontend
    const formatted = conversations.map((c: any) => {
      const otherUser = c.participants.find((p: any) => p.id !== userId) || c.participants[0];
      return {
        id: c.id,
        user: {
          id: otherUser.id,
          name: otherUser.fullName,
          academicYear: otherUser.academicYear,
          branch: otherUser.branch,
          avatar: otherUser.fullName.charAt(0)
        },
        lastMessage: c.messages[0]?.content || "No messages yet.",
        time: c.messages[0]?.createdAt || c.updatedAt,
        unreadCount: c._count.messages
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/messages", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const { targetUserId } = body;

    if (!targetUserId) return new NextResponse("Target User ID required", { status: 400 });

    if (userId === targetUserId) {
      return new NextResponse("Cannot message yourself", { status: 400 });
    }

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: userId } } },
          { participants: { some: { id: targetUserId } } }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Create new
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: userId }, { id: targetUserId }]
        }
      }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error("POST /api/messages", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

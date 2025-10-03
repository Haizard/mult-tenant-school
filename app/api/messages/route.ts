import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const senderId = searchParams.get('senderId');
    const recipientId = searchParams.get('recipientId');
    const threadId = searchParams.get('threadId');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const where: any = {
      tenantId,
      OR: [
        { senderId: userId },
        { recipientId: userId }
      ]
    };

    if (type) where.messageType = type;
    if (status) where.status = status;
    if (senderId) where.senderId = senderId;
    if (recipientId) where.recipientId = recipientId;
    if (threadId) where.threadId = threadId;
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          recipient: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          replyTo: {
            select: { id: true, subject: true, content: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.message.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipientId,
      subject,
      content,
      messageType = 'DIRECT',
      priority = 'NORMAL',
      scheduledAt,
      attachments,
      threadId,
      replyToId
    } = body;

    if (!recipientId || !content) {
      return NextResponse.json(
        { success: false, message: 'Recipient ID and content are required' },
        { status: 400 }
      );
    }

    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify recipient exists and belongs to tenant
    const recipient = await prisma.user.findFirst({
      where: {
        id: recipientId,
        tenantId
      }
    });

    if (!recipient) {
      return NextResponse.json(
        { success: false, message: 'Recipient not found' },
        { status: 404 }
      );
    }

    const messageData = {
      tenantId,
      senderId: userId,
      recipientId,
      subject,
      content,
      messageType,
      priority,
      status: scheduledAt ? 'SCHEDULED' : 'SENT',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      sentAt: scheduledAt ? null : new Date(),
      attachments: attachments || null,
      threadId,
      replyToId
    };

    const message = await prisma.message.create({
      data: messageData,
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log communication
    await prisma.communicationLog.create({
      data: {
        tenantId,
        userId,
        communicationType: 'MESSAGE',
        messageId: message.id,
        recipientId,
        recipientType: 'INDIVIDUAL',
        channel: 'IN_APP',
        status: scheduledAt ? 'PENDING' : 'SENT'
      }
    });

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Message created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create message' },
      { status: 500 }
    );
  }
}

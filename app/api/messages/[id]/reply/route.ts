import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { content, attachments } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      );
    }

    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true }
    });

    if (!user?.tenantId) {
      return NextResponse.json(
        { success: false, message: 'User tenant not found' },
        { status: 400 }
      );
    }

    // Get original message to determine thread and recipient
    const originalMessage = await prisma.message.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ]
      }
    });

    if (!originalMessage) {
      return NextResponse.json(
        { success: false, message: 'Original message not found or access denied' },
        { status: 404 }
      );
    }

    // Determine recipient (sender of original message if current user is recipient, vice versa)
    const recipientId = originalMessage.senderId === session.user.id 
      ? originalMessage.recipientId 
      : originalMessage.senderId;

    const replyData = {
      tenantId: user.tenantId,
      senderId: session.user.id,
      recipientId,
      subject: originalMessage.subject ? `Re: ${originalMessage.subject}` : 'Re: Message',
      content,
      messageType: 'DIRECT',
      priority: 'NORMAL',
      status: 'SENT',
      sentAt: new Date(),
      attachments: attachments || null,
      threadId: originalMessage.threadId || originalMessage.id,
      replyToId: id
    };

    const reply = await prisma.message.create({
      data: replyData,
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
      }
    });

    // Create communication log
    await prisma.communicationLog.create({
      data: {
        tenantId: user.tenantId,
        userId: session.user.id,
        communicationType: 'MESSAGE',
        messageId: reply.id,
        recipientId,
        recipientType: 'INDIVIDUAL',
        channel: 'IN_APP',
        status: 'SENT'
      }
    });

    return NextResponse.json({
      success: true,
      data: reply,
      message: 'Reply sent successfully'
    });

  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send reply',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PUT(
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

    // Find the message that belongs to the user as recipient and is not read
    const message = await prisma.message.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
        recipientId: session.user.id,
        isRead: false
      }
    });

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message not found, already read, or access denied' },
        { status: 404 }
      );
    }

    // Mark message as read
    await prisma.message.update({
      where: { id },
      data: { 
        isRead: true, 
        readAt: new Date(),
        status: 'READ'
      }
    });

    // Update communication log
    await prisma.communicationLog.updateMany({
      where: {
        tenantId: user.tenantId,
        messageId: id,
        recipientId: session.user.id
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to mark message as read',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

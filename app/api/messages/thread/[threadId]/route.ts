import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { threadId } = params;

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

    // Get all messages in the thread that the user is involved in
    const messages = await prisma.message.findMany({
      where: {
        tenantId: user.tenantId,
        threadId,
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ]
      },
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
      orderBy: { createdAt: 'asc' }
    });

    if (messages.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Thread not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Error fetching message thread:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch message thread',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

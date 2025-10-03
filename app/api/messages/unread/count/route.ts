import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
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

    // Count unread messages for the user
    const count = await prisma.message.count({
      where: {
        tenantId: user.tenantId,
        recipientId: session.user.id,
        isRead: false,
        status: { in: ['SENT', 'DELIVERED'] }
      }
    });

    return NextResponse.json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error('Error getting unread message count:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get unread message count',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

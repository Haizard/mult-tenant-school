import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/announcements/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const announcement = await prisma.announcement.findFirst({
      where: {
        id,
        tenantId
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!announcement) {
      return NextResponse.json(
        { success: false, message: 'Announcement not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.announcement.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    // Log communication
    await prisma.communicationLog.create({
      data: {
        tenantId,
        userId,
        communicationType: 'ANNOUNCEMENT',
        announcementId: id,
        recipientId: userId,
        recipientType: 'INDIVIDUAL',
        channel: 'IN_APP',
        status: 'READ',
        readAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch announcement' },
      { status: 500 }
    );
  }
}

// PUT /api/announcements/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, content, category, priority, targetAudience, publishDate, expiryDate, status } = body;

    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const existingAnnouncement = await prisma.announcement.findFirst({
      where: {
        id,
        tenantId,
        authorId: userId
      }
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { success: false, message: 'Announcement not found or unauthorized' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (publishDate !== undefined) updateData.publishDate = publishDate ? new Date(publishDate) : null;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (status !== undefined) updateData.status = status;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: announcement,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// DELETE /api/announcements/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const announcement = await prisma.announcement.findFirst({
      where: {
        id,
        tenantId,
        authorId: userId
      }
    });

    if (!announcement) {
      return NextResponse.json(
        { success: false, message: 'Announcement not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.announcement.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}

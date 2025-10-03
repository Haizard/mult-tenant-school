import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/announcements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const targetAudience = searchParams.get('targetAudience');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Get tenant ID from headers (set by middleware)
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID not found' },
        { status: 400 }
      );
    }

    const where: any = {
      tenantId,
      status: 'PUBLISHED' // Only show published announcements by default
    };

    if (category) where.category = category;
    if (status) where.status = status;
    if (targetAudience) where.targetAudience = targetAudience;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.announcement.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        announcements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST /api/announcements
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      category = 'GENERAL',
      priority = 'MEDIUM',
      targetAudience = 'ALL',
      publishDate,
      expiryDate,
      attachments
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Get tenant ID and user ID from headers
    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const announcementData = {
      tenantId,
      authorId: userId,
      title,
      content,
      category,
      priority,
      targetAudience,
      status: publishDate ? 'SCHEDULED' : 'PUBLISHED',
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      attachments: attachments || null
    };

    const announcement = await prisma.announcement.create({
      data: announcementData,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log communication
    await prisma.communicationLog.create({
      data: {
        tenantId,
        userId,
        communicationType: 'ANNOUNCEMENT',
        announcementId: announcement.id,
        recipientType: targetAudience === 'ALL' ? 'ALL_STUDENTS' : targetAudience,
        channel: 'IN_APP',
        status: publishDate ? 'PENDING' : 'SENT'
      }
    });

    return NextResponse.json({
      success: true,
      data: announcement,
      message: 'Announcement created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

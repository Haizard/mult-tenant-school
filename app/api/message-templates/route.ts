import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/message-templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID not found' },
        { status: 400 }
      );
    }

    const where: any = {
      tenantId
    };

    if (category) where.category = category;
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.messageTemplate.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.messageTemplate.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        templates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching message templates:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch message templates' },
      { status: 500 }
    );
  }
}

// POST /api/message-templates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      subject,
      content,
      category = 'GENERAL',
      variables
    } = body;

    if (!name || !content) {
      return NextResponse.json(
        { success: false, message: 'Name and content are required' },
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

    const template = await prisma.messageTemplate.create({
      data: {
        tenantId,
        createdById: userId,
        name,
        description,
        subject,
        content,
        category,
        variables: variables || null
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Message template created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating message template:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create message template' },
      { status: 500 }
    );
  }
}

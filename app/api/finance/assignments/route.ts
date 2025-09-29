import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Get the first available tenant for demo purposes
    const firstTenant = await prisma.tenant.findFirst();
    if (!firstTenant) {
      return NextResponse.json(
        { success: false, error: 'No tenants found. Please set up the system first.' },
        { status: 400 }
      );
    }

    const whereClause: any = {
      tenantId: firstTenant.id,
    };

    if (search) {
      whereClause.OR = [
        { student: { user: { firstName: { contains: search, mode: 'insensitive' } } } },
        { student: { user: { lastName: { contains: search, mode: 'insensitive' } } } },
        { student: { studentId: { contains: search, mode: 'insensitive' } } },
        { fee: { feeName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const [assignments, total] = await Promise.all([
      prisma.feeAssignment.findMany({
        where: whereClause,
        include: {
          fee: true,
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          academicYear: true,
          class: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              paymentDate: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.feeAssignment.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: assignments,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching fee assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fee assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      feeId,
      studentId,
      academicYearId,
      classId,
      assignedAmount,
      discountAmount,
      scholarshipAmount,
      dueDate,
      notes,
    } = body;

    // Get the first available user and tenant for demo purposes
    const firstUser = await prisma.user.findFirst();
    const firstTenant = await prisma.tenant.findFirst();
    
    if (!firstUser || !firstTenant) {
      return NextResponse.json(
        { success: false, error: 'No users or tenants found. Please set up the system first.' },
        { status: 400 }
      );
    }

    const finalAmount = parseFloat(assignedAmount) - parseFloat(discountAmount || 0) - parseFloat(scholarshipAmount || 0);

    const assignment = await prisma.feeAssignment.create({
      data: {
        tenantId: firstTenant.id,
        feeId,
        studentId,
        academicYearId,
        classId,
        assignedAmount: parseFloat(assignedAmount),
        discountAmount: parseFloat(discountAmount || 0),
        scholarshipAmount: parseFloat(scholarshipAmount || 0),
        finalAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        createdBy: firstUser.id,
      },
      include: {
        fee: true,
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        academicYear: true,
        class: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: assignment,
      message: 'Fee assignment created successfully',
    });
  } catch (error) {
    console.error('Error creating fee assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create fee assignment' },
      { status: 500 }
    );
  }
}

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
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: whereClause,
        include: {
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
          feeAssignment: {
            include: {
              fee: true,
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
        orderBy: { issueDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      feeAssignmentId,
      studentId,
      academicYearId,
      classId,
      totalAmount,
      currency,
      dueDate,
      paymentTerms,
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

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { tenantId: firstTenant.id },
    });
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: firstTenant.id,
        invoiceNumber,
        feeAssignmentId,
        studentId,
        academicYearId,
        classId,
        totalAmount: parseFloat(totalAmount),
        outstandingAmount: parseFloat(totalAmount),
        currency: currency || 'TZS',
        dueDate: new Date(dueDate),
        paymentTerms,
        notes,
        createdBy: firstUser.id,
      },
      include: {
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
        feeAssignment: {
          include: {
            fee: true,
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
      data: invoice,
      message: 'Invoice created successfully',
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

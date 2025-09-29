import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
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
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
        { receiptNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      whereClause.expenseCategory = category;
    }

    if (status) {
      whereClause.status = status;
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          budget: true,
        },
        orderBy: { expenseDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      expenseCategory,
      title,
      description,
      amount,
      currency,
      expenseDate,
      vendor,
      receiptNumber,
      budgetId,
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

    const expense = await prisma.expense.create({
      data: {
        tenantId: firstTenant.id,
        expenseCategory,
        title,
        description,
        amount: parseFloat(amount),
        currency: currency || 'TZS',
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        vendor,
        receiptNumber,
        budgetId,
        createdBy: firstUser.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        budget: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Expense created successfully',
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

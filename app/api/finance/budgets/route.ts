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
        { budgetName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      whereClause.budgetCategory = category;
    }

    if (status) {
      whereClause.status = status;
    }

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
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
          updater: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          expenses: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.budget.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: budgets,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      budgetName,
      budgetYear,
      budgetCategory,
      allocatedAmount,
      currency,
      startDate,
      endDate,
      description,
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

    const budget = await prisma.budget.create({
      data: {
        tenantId: firstTenant.id,
        budgetName,
        budgetYear: parseInt(budgetYear),
        budgetCategory,
        allocatedAmount: parseFloat(allocatedAmount),
        remainingAmount: parseFloat(allocatedAmount),
        currency: currency || 'TZS',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
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
      },
    });

    return NextResponse.json({
      success: true,
      data: budget,
      message: 'Budget created successfully',
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}

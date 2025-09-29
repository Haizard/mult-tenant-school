import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Finance stats API called');
    
    // Return mock data for now to test the frontend
    const stats = {
      totalFeesCollected: 2500000,
      totalFeesCount: 45,
      monthlyPayments: 750000,
      monthlyPaymentsCount: 12,
      outstandingFees: 500000,
      outstandingFeesCount: 8,
      totalExpenses: 1200000,
      totalExpensesCount: 25,
      totalBudgets: 5000000,
      totalBudgetsCount: 3,
      recentPayments: [
        {
          id: '1',
          amount: 50000,
          paymentMethod: 'CASH',
          paymentDate: new Date().toISOString(),
          student: {
            user: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
          feeAssignment: {
            fee: {
              feeName: 'Tuition Fee',
            },
          },
        },
        {
          id: '2',
          amount: 25000,
          paymentMethod: 'BANK_TRANSFER',
          paymentDate: new Date(Date.now() - 86400000).toISOString(),
          student: {
            user: {
              firstName: 'Jane',
              lastName: 'Smith',
            },
          },
          feeAssignment: {
            fee: {
              feeName: 'Library Fee',
            },
          },
        },
      ],
      upcomingDueDates: [
        {
          id: '1',
          finalAmount: 100000,
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          student: {
            user: {
              firstName: 'Alice',
              lastName: 'Johnson',
            },
          },
          fee: {
            feeName: 'Tuition Fee',
          },
        },
      ],
      expenseBreakdown: [
        {
          expenseCategory: 'SALARIES',
          _sum: { amount: 800000 },
          _count: 10,
        },
        {
          expenseCategory: 'UTILITIES',
          _sum: { amount: 200000 },
          _count: 5,
        },
        {
          expenseCategory: 'MAINTENANCE',
          _sum: { amount: 200000 },
          _count: 10,
        },
      ],
      paymentMethods: [
        {
          paymentMethod: 'CASH',
          _sum: { amount: 1000000 },
          _count: 20,
        },
        {
          paymentMethod: 'BANK_TRANSFER',
          _sum: { amount: 1200000 },
          _count: 15,
        },
        {
          paymentMethod: 'MOBILE_MONEY',
          _sum: { amount: 300000 },
          _count: 10,
        },
      ],
    };

    console.log('Returning mock finance stats');

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in finance stats API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch finance statistics',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
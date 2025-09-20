import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get total counts by status
    const [total, pending, approved, rejected, emergency] = await Promise.all([
      prisma.leaveRequest.count({ where }),
      prisma.leaveRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.leaveRequest.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.leaveRequest.count({ where: { ...where, status: 'REJECTED' } }),
      prisma.leaveRequest.count({ where: { ...where, isEmergency: true } })
    ]);

    // Get counts by leave type
    const leaveTypeStats = await prisma.leaveRequest.groupBy({
      by: ['leaveType'],
      where,
      _count: {
        leaveType: true
      }
    });

    const byType: Record<string, number> = {};
    leaveTypeStats.forEach(stat => {
      byType[stat.leaveType] = stat._count.leaveType;
    });

    return NextResponse.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        emergency,
        byType
      }
    });
  } catch (error) {
    console.error('Error fetching leave stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leave statistics', details: error.message },
      { status: 500 }
    );
  }
}
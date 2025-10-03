import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user with tenant information
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { tenantId: true, status: true }
    });

    if (!user?.tenantId || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'User not found or inactive' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    const where: any = { tenantId: user.tenantId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (type) where.communicationType = type;

    // Get comprehensive communication statistics
    const [
      totalCommunications,
      messageStats,
      announcementStats,
      channelStats,
      statusStats,
      dailyStats,
      userStats,
      templateStats
    ] = await Promise.all([
      // Total communications count
      prisma.communicationLog.count({ where }),

      // Message type breakdown
      prisma.communicationLog.groupBy({
        by: ['communicationType'],
        where,
        _count: { id: true }
      }),

      // Announcement category breakdown
      prisma.announcement.groupBy({
        by: ['category'],
        where: { 
          tenantId: user.tenantId,
          ...(startDate || endDate ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) })
            }
          } : {})
        },
        _count: { id: true }
      }),

      // Channel distribution
      prisma.communicationLog.groupBy({
        by: ['channel'],
        where,
        _count: { id: true }
      }),

      // Status distribution
      prisma.communicationLog.groupBy({
        by: ['status'],
        where,
        _count: { id: true }
      }),

      // Daily communication volume (last 30 days)
      prisma.communicationLog.groupBy({
        by: ['createdAt'],
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _count: { id: true }
      }),

      // Top communicators
      prisma.communicationLog.groupBy({
        by: ['userId'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),

      // Template usage stats
      prisma.messageTemplate.findMany({
        where: { 
          tenantId: user.tenantId,
          usageCount: { gt: 0 }
        },
        select: {
          id: true,
          name: true,
          category: true,
          usageCount: true,
          lastUsedAt: true
        },
        orderBy: { usageCount: 'desc' },
        take: 10
      })
    ]);

    // Process daily stats to group by date
    const dailyStatsMap = new Map();
    dailyStats.forEach(stat => {
      const date = new Date(stat.createdAt).toISOString().split('T')[0];
      dailyStatsMap.set(date, (dailyStatsMap.get(date) || 0) + stat._count.id);
    });

    const processedDailyStats = Array.from(dailyStatsMap.entries()).map(([date, count]) => ({
      date,
      count
    }));

    // Get user details for top communicators
    const userIds = userStats.map(stat => stat.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, role: true }
    });

    const processedUserStats = userStats.map(stat => {
      const user = users.find(u => u.id === stat.userId);
      return {
        userId: stat.userId,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        userRole: user?.role || 'Unknown',
        count: stat._count.id
      };
    });

    // Calculate additional metrics
    const totalMessages = await prisma.message.count({
      where: { 
        tenantId: user.tenantId,
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        } : {})
      }
    });

    const totalAnnouncements = await prisma.announcement.count({
      where: { 
        tenantId: user.tenantId,
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        } : {})
      }
    });

    const readRate = await prisma.message.aggregate({
      where: { 
        tenantId: user.tenantId,
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        } : {})
      },
      _avg: { isRead: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCommunications,
          totalMessages,
          totalAnnouncements,
          readRate: Math.round((readRate._avg.isRead || 0) * 100)
        },
        messageStats,
        announcementStats,
        channelStats,
        statusStats,
        dailyStats: processedDailyStats,
        topCommunicators: processedUserStats,
        topTemplates: templateStats
      }
    });

  } catch (error) {
    console.error('Error getting communication stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get communication stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

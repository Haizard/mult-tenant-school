import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const leaveType = searchParams.get('leaveType');
    const studentId = searchParams.get('studentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    
    if (status) where.status = status;
    if (leaveType) where.leaveType = leaveType;
    if (studentId) where.studentId = studentId;

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        student: {
          include: {
            user: true
          }
        },
        requester: true,
        approver: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.leaveRequest.count({ where });

    const formattedRequests = leaveRequests.map(request => ({
      ...request,
      student: {
        id: request.student.id,
        firstName: request.student.user.firstName,
        lastName: request.student.user.lastName,
        studentId: request.student.studentId,
        admissionNumber: request.student.admissionNumber
      },
      requester: {
        id: request.requester.id,
        firstName: request.requester.firstName,
        lastName: request.requester.lastName,
        email: request.requester.email
      },
      approver: request.approver ? {
        id: request.approver.id,
        firstName: request.approver.firstName,
        lastName: request.approver.lastName,
        email: request.approver.email
      } : null
    }));

    return NextResponse.json({
      success: true,
      data: formattedRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leave requests', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, leaveType, startDate, endDate, reason, description, isEmergency } = body;

    // Get the first available user and tenant for demo purposes
    const firstUser = await prisma.user.findFirst();
    const firstTenant = await prisma.tenant.findFirst();
    
    if (!firstUser || !firstTenant) {
      return NextResponse.json(
        { success: false, error: 'No users or tenants found. Please set up the system first.' },
        { status: 400 }
      );
    }
    
    const requestedBy = firstUser.id;
    const tenantId = firstTenant.id;

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        tenantId,
        studentId,
        requestedBy,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        description,
        isEmergency: isEmergency || false
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        requester: true
      }
    });

    return NextResponse.json({
      success: true,
      data: leaveRequest,
      message: 'Leave request created successfully'
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create leave request' },
      { status: 500 }
    );
  }
}
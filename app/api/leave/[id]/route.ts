import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, rejectedReason } = body;

    const updateData: any = { status };
    
    if (status === 'APPROVED') {
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        updateData.approvedBy = firstUser.id;
        updateData.approvedAt = new Date();
      }
    } else if (status === 'REJECTED' && rejectedReason) {
      updateData.rejectedReason = rejectedReason;
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          include: {
            user: true
          }
        },
        requester: true,
        approver: true
      }
    });

    return NextResponse.json({
      success: true,
      data: leaveRequest,
      message: `Leave request ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update leave request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.leaveRequest.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Leave request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete leave request' },
      { status: 500 }
    );
  }
}
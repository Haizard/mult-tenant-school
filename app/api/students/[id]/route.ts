
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Update user data if provided
    if (body.firstName || body.lastName || body.email || body.phone) {
      const student = await prisma.student.findUnique({
        where: { id: params.id },
        select: { userId: true }
      });

      if (student) {
        await prisma.user.update({
          where: { id: student.userId },
          data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            phone: body.phone,
          }
        });
      }
    }

    // Update student data
    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
      data: {
        studentId: body.studentId,
        admissionNumber: body.admissionNumber,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        gender: body.gender,
        nationality: body.nationality,
        religion: body.religion,
        bloodGroup: body.bloodGroup,
        address: body.address,
        city: body.city,
        region: body.region,
        postalCode: body.postalCode,
        emergencyContact: body.emergencyContact,
        emergencyPhone: body.emergencyPhone,
        emergencyRelation: body.emergencyRelation,
        admissionDate: body.admissionDate ? new Date(body.admissionDate) : undefined,
        previousSchool: body.previousSchool,
        previousGrade: body.previousGrade,
        medicalInfo: body.medicalInfo,
        transportMode: body.transportMode,
        transportRoute: body.transportRoute,
        specialNeeds: body.specialNeeds,
        hobbies: body.hobbies,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        }
      }
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get student to find associated user
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      select: { userId: true }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Delete student first (due to foreign key constraint)
    await prisma.student.delete({
      where: { id: params.id }
    });

    // Delete associated user
    await prisma.user.delete({
      where: { id: student.userId }
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}

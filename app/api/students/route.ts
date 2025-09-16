
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const students = await prisma.student.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'studentId', 'dateOfBirth', 'gender'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if email or studentId already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    const existingStudent = await prisma.student.findFirst({
      where: { studentId: body.studentId }
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student ID already exists' },
        { status: 409 }
      );
    }

    // Create user first
    const user = await prisma.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
        role: 'STUDENT',
        tenantId: 'default', // You might want to get this from the session/context
      }
    });

    // Create student profile
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentId: body.studentId,
        admissionNumber: body.admissionNumber || null,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        nationality: body.nationality || null,
        religion: body.religion || null,
        bloodGroup: body.bloodGroup || null,
        address: body.address || null,
        city: body.city || null,
        region: body.region || null,
        postalCode: body.postalCode || null,
        emergencyContact: body.emergencyContact || null,
        emergencyPhone: body.emergencyPhone || null,
        emergencyRelation: body.emergencyRelation || null,
        admissionDate: body.admissionDate ? new Date(body.admissionDate) : null,
        previousSchool: body.previousSchool || null,
        previousGrade: body.previousGrade || null,
        medicalInfo: body.medicalInfo || null,
        transportMode: body.transportMode || null,
        transportRoute: body.transportRoute || null,
        specialNeeds: body.specialNeeds || null,
        hobbies: body.hobbies || null,
        tenantId: 'default', // You might want to get this from the session/context
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

    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    console.error('Error creating student:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Student ID or email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to get user from JWT token
async function getUserFromToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return user;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const hasPermission = user.userRoles.some(userRole => 
      userRole.role.rolePermissions.some(rolePermission => 
        rolePermission.permission.resource === 'students' && 
        rolePermission.permission.action === 'read'
      )
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const students = await prisma.student.findMany({
      where: {
        tenantId: user.tenantId
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
    // Get authenticated user
    const authUser = await getUserFromToken(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const hasPermission = authUser.userRoles.some(userRole => 
      userRole.role.rolePermissions.some(rolePermission => 
        rolePermission.permission.resource === 'students' && 
        rolePermission.permission.action === 'create'
      )
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.studentId || !body.dateOfBirth || !body.gender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email or studentId already exists in the same tenant
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: body.email,
        tenantId: authUser.tenantId
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    const existingStudent = await prisma.student.findFirst({
      where: { 
        studentId: body.studentId,
        tenantId: authUser.tenantId
      }
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
        tenantId: authUser.tenantId,
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
        tenantId: authUser.tenantId,
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

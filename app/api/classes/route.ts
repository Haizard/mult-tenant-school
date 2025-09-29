import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Classes API called');
    
    // Return mock data for now
    const classes = [
      {
        id: '1',
        className: 'Form 1',
        classCode: 'F1',
        academicLevel: 'O_LEVEL',
        description: 'Form 1 class',
        capacity: 30,
        academicYear: {
          id: '1',
          yearName: '2025/2026',
        },
        classTeacher: {
          id: '1',
          firstName: 'John',
          lastName: 'Teacher',
          email: 'teacher@sampleschool.com',
        },
      },
      {
        id: '2',
        className: 'Form 2',
        classCode: 'F2',
        academicLevel: 'O_LEVEL',
        description: 'Form 2 class',
        capacity: 30,
        academicYear: {
          id: '1',
          yearName: '2025/2026',
        },
        classTeacher: {
          id: '2',
          firstName: 'Jane',
          lastName: 'Teacher',
          email: 'teacher2@sampleschool.com',
        },
      },
      {
        id: '3',
        className: 'Form 3',
        classCode: 'F3',
        academicLevel: 'O_LEVEL',
        description: 'Form 3 class',
        capacity: 30,
        academicYear: {
          id: '1',
          yearName: '2025/2026',
        },
        classTeacher: {
          id: '3',
          firstName: 'Bob',
          lastName: 'Teacher',
          email: 'teacher3@sampleschool.com',
        },
      },
      {
        id: '4',
        className: 'Form 4',
        classCode: 'F4',
        academicLevel: 'O_LEVEL',
        description: 'Form 4 class',
        capacity: 30,
        academicYear: {
          id: '1',
          yearName: '2025/2026',
        },
        classTeacher: {
          id: '4',
          firstName: 'Alice',
          lastName: 'Teacher',
          email: 'teacher4@sampleschool.com',
        },
      },
    ];

    console.log('Returning mock classes data');

    return NextResponse.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error('Error in classes API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch classes',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating class:', body);
    
    // Return mock created class
    const newClass = {
      id: 'new-' + Date.now(),
      ...body,
      academicYear: {
        id: '1',
        yearName: '2025/2026',
      },
      classTeacher: {
        id: '1',
        firstName: 'John',
        lastName: 'Teacher',
        email: 'teacher@sampleschool.com',
      },
    };

    return NextResponse.json({
      success: true,
      data: newClass,
      message: 'Class created successfully',
    });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create class',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
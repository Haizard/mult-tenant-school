import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Finance API called');
    
    // Return mock fees data
    const fees = [
      {
        id: '1',
        feeName: 'Tuition Fee',
        feeType: 'TUITION',
        amount: 500000,
        currency: 'TZS',
        frequency: 'TERM_WISE',
        applicableLevels: ['O_LEVEL', 'A_LEVEL'],
        applicableClasses: ['1', '2', '3', '4'],
        description: 'Tuition fee for students',
        isActive: true,
        effectiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        feeName: 'Admission Fee',
        feeType: 'ADMISSION',
        amount: 100000,
        currency: 'TZS',
        frequency: 'ONE_TIME',
        applicableLevels: ['O_LEVEL', 'A_LEVEL'],
        applicableClasses: ['1', '2', '3', '4'],
        description: 'One-time admission fee',
        isActive: true,
        effectiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        feeName: 'Examination Fee',
        feeType: 'EXAMINATION',
        amount: 50000,
        currency: 'TZS',
        frequency: 'ONE_TIME',
        applicableLevels: ['O_LEVEL', 'A_LEVEL'],
        applicableClasses: ['1', '2', '3', '4'],
        description: 'Examination fee',
        isActive: true,
        effectiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        feeName: 'Library Fee',
        feeType: 'LIBRARY',
        amount: 25000,
        currency: 'TZS',
        frequency: 'ANNUALLY',
        applicableLevels: ['O_LEVEL', 'A_LEVEL'],
        applicableClasses: ['1', '2', '3', '4'],
        description: 'Annual library fee',
        isActive: true,
        effectiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    console.log('Returning mock fees data');

    return NextResponse.json({
      success: true,
      data: fees,
      pagination: {
        page: 1,
        limit: 10,
        total: fees.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error('Error in finance API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch fees',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating fee:', body);
    
    // Return mock created fee
    const newFee = {
      id: 'new-' + Date.now(),
      ...body,
      currency: body.currency || 'TZS',
      isActive: true,
      effectiveDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newFee,
      message: 'Fee created successfully',
    });
  } catch (error) {
    console.error('Error creating fee:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create fee',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Finance payments API called');
    
    // Return mock payments data
    const payments = [
      {
        id: '1',
        studentId: '1',
        amount: 50000,
        currency: 'TZS',
        paymentMethod: 'CASH',
        paymentType: 'FEE_PAYMENT',
        transactionId: 'TXN001',
        referenceNumber: 'REF001',
        paymentDate: new Date().toISOString(),
        status: 'COMPLETED',
        notes: 'Tuition fee payment',
        receiptNumber: 'RCP001',
        processedBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        student: {
          id: '1',
          studentId: 'STU001',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        feeAssignment: {
          id: '1',
          fee: {
            feeName: 'Tuition Fee',
          },
        },
      },
      {
        id: '2',
        studentId: '2',
        amount: 25000,
        currency: 'TZS',
        paymentMethod: 'BANK_TRANSFER',
        paymentType: 'FEE_PAYMENT',
        transactionId: 'TXN002',
        referenceNumber: 'REF002',
        paymentDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'COMPLETED',
        notes: 'Library fee payment',
        receiptNumber: 'RCP002',
        processedBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        student: {
          id: '2',
          studentId: 'STU002',
          user: {
            firstName: 'Jane',
            lastName: 'Smith',
          },
        },
        feeAssignment: {
          id: '2',
          fee: {
            feeName: 'Library Fee',
          },
        },
      },
      {
        id: '3',
        studentId: '3',
        amount: 100000,
        currency: 'TZS',
        paymentMethod: 'MOBILE_MONEY',
        paymentType: 'FEE_PAYMENT',
        transactionId: 'TXN003',
        referenceNumber: 'REF003',
        paymentDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        status: 'COMPLETED',
        notes: 'Admission fee payment',
        receiptNumber: 'RCP003',
        processedBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        student: {
          id: '3',
          studentId: 'STU003',
          user: {
            firstName: 'Bob',
            lastName: 'Johnson',
          },
        },
        feeAssignment: {
          id: '3',
          fee: {
            feeName: 'Admission Fee',
          },
        },
      },
    ];

    console.log('Returning mock payments data');

    return NextResponse.json({
      success: true,
      data: payments,
      pagination: {
        page: 1,
        limit: 10,
        total: payments.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error('Error in finance payments API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch payments',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating payment:', body);
    
    // Return mock created payment
    const newPayment = {
      id: 'new-' + Date.now(),
      ...body,
      currency: body.currency || 'TZS',
      status: 'COMPLETED',
      paymentDate: new Date().toISOString(),
      transactionId: 'TXN' + Date.now(),
      referenceNumber: 'REF' + Date.now(),
      receiptNumber: 'RCP' + Date.now(),
      processedBy: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newPayment,
      message: 'Payment created successfully',
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create payment',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
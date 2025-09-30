import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/content/${params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch content',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Handle both JSON and FormData
    const contentType = request.headers.get('content-type') || '';
    let body;
    
    if (contentType.includes('multipart/form-data')) {
      body = await request.formData();
    } else {
      body = JSON.stringify(await request.json());
    }

    const response = await fetch(`${BACKEND_URL}/api/content/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        ...(contentType.includes('application/json') && {
          'Content-Type': 'application/json'
        })
      },
      body,
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Content update API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update content',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/content/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Content delete API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete content',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

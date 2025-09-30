import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // Forward the request to backend
    const response = await fetch(`${BACKEND_URL}/api/content?${queryString}`, {
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

export async function POST(request: NextRequest) {
  try {
    // Handle both JSON and FormData
    const contentType = request.headers.get('content-type') || '';
    let body;
    
    if (contentType.includes('multipart/form-data')) {
      // For file uploads, pass the FormData directly
      body = await request.formData();
    } else {
      // For JSON requests
      body = JSON.stringify(await request.json());
    }

    const response = await fetch(`${BACKEND_URL}/api/content`, {
      method: 'POST',
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
    console.error('Content creation API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create content',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

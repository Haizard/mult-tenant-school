import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;
    const circulationId = params.id;

    let url = '';
    if (action === 'return') {
      url = `${process.env.BACKEND_URL}/api/library/circulations/${circulationId}/return`;
    } else if (action === 'renew') {
      url = `${process.env.BACKEND_URL}/api/library/circulations/${circulationId}/renew`;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Must be "return" or "renew"' },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || `Failed to ${action} circulation` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Library Circulation Action API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

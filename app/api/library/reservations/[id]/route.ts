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
    const reservationId = params.id;

    let url = '';
    if (action === 'fulfill') {
      url = `${process.env.BACKEND_URL}/api/library/reservations/${reservationId}/fulfill`;
    } else if (action === 'cancel') {
      url = `${process.env.BACKEND_URL}/api/library/reservations/${reservationId}/cancel`;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Must be "fulfill" or "cancel"' },
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
        { success: false, message: errorData.message || `Failed to ${action} reservation` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Library Reservation Action API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

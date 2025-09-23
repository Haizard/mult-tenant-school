import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);

    // Check if this is an enrollment stats request
    if (searchParams.has("enrollment")) {
      const response = await fetch(
        `${BACKEND_URL}/api/academic/classes/${params.id}/enrollment`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader || "",
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // Regular class details request
    const response = await fetch(
      `${BACKEND_URL}/api/academic/classes/${params.id}`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader || "",
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching class:", error);
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();
    const { searchParams } = new URL(request.url);

    // Check if this is an enrollment management request
    if (searchParams.has("enrollment") || body.action) {
      const response = await fetch(
        `${BACKEND_URL}/api/academic/classes/${params.id}/enrollment`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // Default POST behavior for class creation/updates
    return NextResponse.json(
      { error: "Invalid POST request" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error handling class POST:", error);
    return NextResponse.json(
      { error: "Failed to handle class request" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/academic/classes/${params.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: authHeader || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authHeader = request.headers.get("authorization");

    const response = await fetch(
      `${BACKEND_URL}/api/academic/classes/${params.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: authHeader || "",
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Mock session data for demonstration purposes
    const session = {
      user: {
        name: "John Doe",
        email: "john.doe@example.com",
      },
      expires: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    return NextResponse.json(session);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while fetching the session." },
      { status: 500 }
    );
  }
}

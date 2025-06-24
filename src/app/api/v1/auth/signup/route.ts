import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the input
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Add your signup logic here (e.g., saving user to the database)
    // Example:
    // const user = await prisma.user.create({
    //   data: { email, password },
    // });

    return NextResponse.json({ message: "Signup successful." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred during signup." },
      { status: 500 }
    );
  }
}

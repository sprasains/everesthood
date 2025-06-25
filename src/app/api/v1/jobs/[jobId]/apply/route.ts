import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { jobId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { jobId } = params;
    const application = await prisma.jobApplication.create({
        data: { jobId, applicantId: session.user.id }
    });
    return NextResponse.json(application, { status: 201 });
}

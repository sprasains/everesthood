import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all active jobs (publicly accessible)
export async function GET(req: NextRequest) {
    const jobs = await prisma.job.findMany({
        where: { isActive: true },
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 50,
    });
    return NextResponse.json({ jobs });
}

// POST a new job (protected, requires a company profile)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: session.user.id } });
    if (!company) return new NextResponse("User does not own a company profile.", { status: 403 });

    const { title, description, location, type } = await req.json();
    const newJob = await prisma.job.create({
        data: { title, description, location, type, companyId: company.id, companyName: company.name }
    });
    return NextResponse.json(newJob, { status: 201 });
}

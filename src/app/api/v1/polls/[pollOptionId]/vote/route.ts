/**
 * @swagger
 * /api/v1/polls/{pollOptionId}/vote:
 *   post:
 *     summary: Vote for a poll option
 *     description: Allows an authenticated user to vote for a poll option. Prevents double voting.
 *     parameters:
 *       - in: path
 *         name: pollOptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vote recorded
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Already voted
 *       500:
 *         description: Server error
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { pollOptionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.warn("Unauthorized poll vote attempt");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { pollOptionId } = params;
  try {
    // Find the poll for this option
    const pollOption = await prisma.pollOption.findUnique({
      where: { id: pollOptionId },
      include: { poll: true },
    });
    if (!pollOption) {
      console.warn(`Poll option not found: ${pollOptionId}`);
      return new NextResponse("Poll option not found", { status: 404 });
    }
    // Check if user already voted in this poll
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: session.user.id,
        pollOption: { pollId: pollOption.pollId },
      },
    });
    if (existingVote) {
      console.info(
        `User ${session.user.id} attempted double vote on poll ${pollOption.pollId}`
      );
      return new NextResponse("You have already voted in this poll", {
        status: 409,
      });
    }
    const vote = await prisma.vote.create({
      data: { userId: session.user.id, pollOptionId },
    });
    console.info(
      `User ${session.user.id} voted for option ${pollOptionId} in poll ${pollOption.pollId}`
    );
    return NextResponse.json(vote);
  } catch (error) {
    console.error("Poll voting error:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}

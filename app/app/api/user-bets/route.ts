import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper function to validate and get all bets
async function validateAndGetBets() {
  const allBets = await prisma.bet.findMany();

  if (allBets.length !== 3) {
    throw new Error("Expected 3 bets to be available");
  }

  return allBets;
}

// Helper function to create user bets from a mapping
async function createUserBetsFromMapping(
  userId: string,
  betOutcomes: { [key: string]: string },
  allBets: any[]
) {
  const userBetData = [];

  // Validate that we have outcomes for all expected bets
  const expectedBetIds = [
    "testnet_announcement_video_likes",
    "new_ai_model_surpass_o3",
    "genlayer_ama_375_members",
  ];
  const missingOutcomes = expectedBetIds.filter((betId) => !betOutcomes[betId]);

  if (missingOutcomes.length > 0) {
    throw new Error(`Missing outcomes for bets: ${missingOutcomes.join(", ")}`);
  }

  for (const bet of allBets) {
    const outcome = betOutcomes[bet.betId];
    if (outcome !== undefined) {
      userBetData.push({
        userId,
        betId: bet.id,
        selectedOutcome: outcome,
      });
    }
  }

  // Validate that we have exactly 3 bets mapped
  if (userBetData.length !== 3) {
    throw new Error("Invalid bet mapping - expected 3 bets");
  }

  // Create all user bets
  for (const data of userBetData) {
    await prisma.userBet.create({
      data: data,
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
      const allUserBets = await prisma.userBet.findMany({
        include: {
          user: true,
          bet: true,
        },
      });

      const totalUsers = await prisma.user.count();
      const userAddresses = await prisma.user.findMany({
        select: { address: true },
      });

      return NextResponse.json({
        total_users: totalUsers,
        user_addresses: userAddresses.map((u) => u.address),
        user_bets: allUserBets,
      });
    }

    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        userBets: {
          include: {
            bet: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        total_users: 0,
        user_addresses: [],
        user_bet_selections: [],
        user_handlers: {},
      });
    }

    return NextResponse.json({
      total_users: 1,
      user_addresses: [user.address],
      user_bet_selections: user.userBets.map((ub) => ({
        bet_id: ub.bet.betId,
        selected_outcome: ub.selectedOutcome,
      })),
      user_handlers: {
        discord_handler: user.discordHandle,
        x_handler: user.xHandle,
      },
      user_id: user.id,
    });
  } catch (error) {
    console.error("Error fetching user bets:", error);
    return NextResponse.json(
      { error: "Failed to fetch user bets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, discordHandle, xHandle, betOutcomes } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    if (!betOutcomes || typeof betOutcomes !== "object") {
      return NextResponse.json(
        { error: "betOutcomes mapping is required" },
        { status: 400 }
      );
    }

    const userAddress = address.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { address: userAddress },
      include: {
        userBets: {
          include: {
            bet: true,
          },
        },
      },
    });

    let userId: string;

    if (existingUser) {
      // Check if user has already placed bets
      if (existingUser.userBets.length > 0) {
        return NextResponse.json(
          {
            error: "User has already placed bets and cannot update them",
          },
          { status: 409 }
        );
      }

      // If user exists but has no bets, allow them to place bets
      userId = existingUser.id;
      const allBets = await validateAndGetBets();
      await createUserBetsFromMapping(userId, betOutcomes, allBets);
    } else {
      // Create new user and their bets
      const newUser = await prisma.user.create({
        data: {
          address: userAddress,
          discordHandle,
          xHandle,
        },
      });

      userId = newUser.id;
      const allBets = await validateAndGetBets();
      await createUserBetsFromMapping(userId, betOutcomes, allBets);
    }

    return NextResponse.json({
      consensus_data: {
        leader_receipt: [
          {
            execution_result: "SUCCESS",
          },
        ],
      },
      user_id: userId,
    });
  } catch (error) {
    console.error("Error placing bets:", error);

    // Handle specific validation errors
    if (error instanceof Error) {
      if (
        error.message.includes("Expected 3 bets") ||
        error.message.includes("Invalid bet mapping") ||
        error.message.includes("Missing outcomes")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to place bets" },
      { status: 500 }
    );
  }
}

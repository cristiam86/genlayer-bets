import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const bets = await prisma.bet.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bets);
  } catch (error) {
    console.error("Error fetching bets:", error);
    return NextResponse.json(
      { error: "Failed to fetch bets" },
      { status: 500 }
    );
  }
}

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()

//     const bet = await prisma.bet.create({
//       data: {
//         betId: body.betId,
//         title: body.title,
//         description: body.description,
//         category: body.category,
//         resolutionDate: body.resolutionDate,
//         resolutionUrl: body.resolutionUrl,
//         resolutionXMethod: body.resolutionXMethod,
//         resolutionXParameter: body.resolutionXParameter,
//       }
//     })

//     return NextResponse.json(bet)
//   } catch (error) {
//     console.error('Error creating bet:', error)
//     return NextResponse.json({ error: 'Failed to create bet' }, { status: 500 })
//   }
// }

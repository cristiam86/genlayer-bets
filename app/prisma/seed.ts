import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Create initial bets
  const bets = [
    {
      betId: "testnet_announcement_video_likes",
      title: "More than 700 likes on the testnet announcement video",
      description:
        "Will the testnet announcement video reach more than 700 likes until July 10th?",
      category: "Community",
      resolutionDate: "2025-07-10",
      resolutionXMethod: "get_tweet_data",
      resolutionXParameter: "1935668887577632966",
    },
    {
      betId: "new_ai_model_surpass_o3",
      title: "New AI Model Surpassing OpenAI's o3",
      description:
        "Will any provider release an AI model with a score higher than 71 on the Artificial Intelligence Index according to artificialanalysis.ai/#artificial-analysis-intelligence-index before July 10th surpassing OpenAI's o3 pro model?",
      category: "AI",
      resolutionDate: "2025-07-10",
      resolutionUrl: "https://artificialanalysis.ai/leaderboards/models",
    },
    {
      betId: "genlayer_ama_375_members",
      title: "Genlayer AMA Membership Milestone",
      description:
        "Will one Genlayer AMA surpass more than 375 members according to @Cryptony09's post from X?",
      category: "Community",
      resolutionDate: "2025-07-10",
      resolutionXMethod: "get_user_latest_tweets",
      resolutionXParameter: "Cryptony09",
    },
  ];

  for (const bet of bets) {
    await prisma.bet.upsert({
      where: { betId: bet.betId },
      update: bet,
      create: bet,
    });
  }

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

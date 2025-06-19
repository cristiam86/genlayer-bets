import { readFileSync } from "fs";
import path from "path";
import {
  TransactionHash,
  TransactionStatus,
  GenLayerClient,
} from "genlayer-js/types";

export default async function main(client: GenLayerClient<any>) {
  const filePath = path.resolve(process.cwd(), "contracts/genlayer_bets.py");

  try {
    const contractCode = new Uint8Array(readFileSync(filePath));

    await client.initializeConsensusSmartContract();

    // Deploy the contract
    const deployTransaction = await client.deployContract({
      code: contractCode,
      args: [],
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: deployTransaction as TransactionHash,
      status: TransactionStatus.ACCEPTED,
      retries: 200,
    });

    if (
      receipt.consensus_data?.leader_receipt?.execution_result !== "SUCCESS"
    ) {
      throw new Error(`Deployment failed. Receipt: ${JSON.stringify(receipt)}`);
    }

    console.log("GenLayer Bets contract deployed successfully!");
    const contractAddress = receipt.contract_snapshot?.contract_address;
    console.log("Contract address:", contractAddress);

    console.log("\nCreating initial bets...");

    // Bet 1: FIFA World Cup - PSG vs. Atletico Madrid
    console.log("Creating Bet 1: FIFA World Cup - PSG vs. Atletico Madrid");
    const bet1Hash = await client.writeContract({
      address: contractAddress,
      functionName: "create_bet",
      args: [
        "fifa_worldcup_psg_vs_atletico_madrid",
        "2025-06-15",
        "https://www.fifa.com/en/match-centre/match/10005/289175/289176/400019155?date=2025-06-15",
        "FIFA World Cup: PSG vs. Atletico Madrid",
        "Who will win the match between PSG and Atletico Madrid?",
        ["PSG", "Atletico Madrid", "Draw"],
      ],
      value: 0n,
    });

    await client.waitForTransactionReceipt({
      hash: bet1Hash as TransactionHash,
      status: TransactionStatus.ACCEPTED,
      retries: 200,
    });
    console.log("✓ Bet 1 created successfully");

    // Bet 2: AI Model with higher intelligence than OpenAI's o3
    console.log("Creating Bet 2: New AI Model Surpassing OpenAI's o3");
    const bet2Hash = await client.writeContract({
      address: contractAddress,
      functionName: "create_bet",
      args: [
        "new_ai_model_surpass_o3",
        "2025-06-20",
        "https://artificialanalysis.ai/leaderboards/models",
        "New AI Model Surpassing OpenAI's o3",
        "Will any provider release an AI model with more than 70 Artificial Intelligence before June 20, surpassing OpenAI's o3 model?",
        ["Yes", "No"],
      ],
      value: 0n,
    });

    await client.waitForTransactionReceipt({
      hash: bet2Hash as TransactionHash,
      status: TransactionStatus.ACCEPTED,
      retries: 200,
    });
    console.log("✓ Bet 2 created successfully");

    // Bet 3: Genlayer AMA membership
    console.log("Creating Bet 3: Genlayer AMA Membership Milestone");
    const bet3Hash = await client.writeContract({
      address: contractAddress,
      functionName: "create_bet",
      args: [
        "genlayer_ama_340_members",
        "2025-06-30",
        "https://x.com/Cryptony09",
        "Genlayer AMA Membership Milestone",
        "Will one Genlayer AMA surpass more than 340 members according to @Cryptony09's post from X?",
        ["Yes", "No"],
      ],
      value: 0n,
    });

    await client.waitForTransactionReceipt({
      hash: bet3Hash as TransactionHash,
      status: TransactionStatus.ACCEPTED,
      retries: 200,
    });
    console.log("✓ Bet 3 created successfully");

    console.log("\n🎉 All initial bets created successfully!");
    console.log("Contract is ready for users to place their bets!");
  } catch (error) {
    throw new Error(`Error during deployment:, ${error}`);
  }
}

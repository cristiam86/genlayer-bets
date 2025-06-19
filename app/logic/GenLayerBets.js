import { createClient } from "genlayer-js";
import { simulator } from "genlayer-js/chains";

class GenLayerBets {
  contractAddress;
  client;

  constructor(contractAddress, account = null, studioUrl = null) {
    this.contractAddress = contractAddress;
    const config = {
      chain: simulator,
      ...(account ? { account } : {}),
      ...(studioUrl ? { endpoint: studioUrl } : {}),
    };
    this.client = createClient(config);
  }

  updateAccount(account) {
    this.client = createClient({ chain: simulator, account });
  }

  async getBets() {
    const bets = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_bets",
      args: [],
    });
    // The new contract returns an array of bet objects directly
    return bets;
  }

  async getPlayerPoints(address) {
    if (!address) {
      return 0;
    }
    const points = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_player_points",
      args: [address],
    });
    return points;
  }

  async getLeaderboard() {
    const points = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_points",
      args: [],
    });
    return Array.from(points.entries())
      .map(([address, points]) => ({
        address,
        points: Number(points),
      }))
      .sort((a, b) => b.points - a.points);
  }

  async placeBet(betId, outcomeIndex) {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "place_bet",
      args: [betId, outcomeIndex],
    });
    const receipt = await this.client.waitForTransactionReceipt({
      hash: txHash,
      status: "FINALIZED",
      interval: 10000,
    });
    return receipt;
  }

  async resolveBet(betId) {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "resolve_bet",
      args: [betId],
    });
    const receipt = await this.client.waitForTransactionReceipt({
      hash: txHash,
      status: "FINALIZED",
      interval: 10000,
      retries: 20,
    });
    return receipt;
  }

  async getOwner() {
    const owner = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_owner",
      args: [],
    });
    return owner;
  }
}

export default GenLayerBets;

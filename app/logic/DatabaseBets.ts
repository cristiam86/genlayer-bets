class DatabaseBets {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  }

  async getBets() {
    try {
      const response = await fetch(`${this.baseUrl}/api/bets`);
      if (!response.ok) throw new Error("Failed to fetch bets");
      return await response.json();
    } catch (error) {
      console.error("Error fetching bets:", error);
      return [];
    }
  }

  async getPlayerPoints(address: string) {
    if (!address) return 0;

    try {
      const response = await fetch(`${this.baseUrl}/api/leaderboard`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      const leaderboard = await response.json();

      const user = leaderboard.find(
        (u: any) => u.address.toLowerCase() === address.toLowerCase()
      );
      return user?.points || 0;
    } catch (error) {
      console.error("Error fetching player points:", error);
      return 0;
    }
  }

  async getLeaderboard() {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaderboard`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return await response.json();
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  }

  async placeBets(
    userDiscordHandler: string,
    userXHandler: string,
    betOutcomes: { [key: string]: string },
    userAddress: string
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/api/user-bets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: userAddress,
          discordHandle: userDiscordHandler,
          xHandle: userXHandler,
          betOutcomes,
        }),
      });

      if (!response.ok) throw new Error("Failed to place bets");
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error placing bets:", error);
      throw error;
    }
  }

  async getAllUserBets(address?: string) {
    try {
      const url = address
        ? `${this.baseUrl}/api/user-bets?address=${encodeURIComponent(address)}`
        : `${this.baseUrl}/api/user-bets`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch user bets");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user bets:", error);
      return {
        total_users: 0,
        user_addresses: [],
        user_bet_selections: [],
        user_handlers: {},
      };
    }
  }
}

export default DatabaseBets;

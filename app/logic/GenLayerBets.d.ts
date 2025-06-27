declare module "@/logic/GenLayerBets" {
  export default class GenLayerBets {
    constructor(contractAddress: string, account?: any, studioUrl?: string);
    updateAccount(account: any): void;
    getBets(): Promise<any[]>;
    getPlayerPoints(address: string): Promise<number>;
    getLeaderboard(): Promise<Array<{ address: string; points: number }>>;
    placeBets(
      userDiscordHandler: string,
      userXHandler: string,
      betOutcomes: { [key: string]: string }
    ): Promise<any>;
    getAllUserBets(address?: string | null): Promise<any>;
    getOwner(): Promise<string>;
  }
}

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

class GenLayerBets {
  contractAddress;
  client;

  constructor(contractAddress, account = null, studioUrl = null) {
    this.contractAddress = contractAddress;
    const config = {
      chain: studionet,
      ...(account ? { account } : {}),
      ...(studioUrl ? { endpoint: studioUrl } : {}),
    };
    this.client = createClient(config);
  }

  updateAccount(account) {
    this.client = createClient({ chain: studionet, account });
  }

  async getBets() {
    const bets = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_bets",
      args: [],
    });
    
    // Convert Map objects to regular objects
    if (Array.isArray(bets)) {
      return bets.map(betMap => {
        const bet = {};
        betMap.forEach((value, key) => {
          bet[key] = value;
        });
        return bet;
      });
    }
    
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

  // async createBet(betId, resolutionDate, resolutionUrl, title, description, category) {
  //   const txHash = await this.client.writeContract({
  //     address: this.contractAddress,
  //     functionName: "create_bet",
  //     args: [betId, resolutionDate, resolutionUrl, title, description, category],
  //   });
  //   const receipt = await this.client.waitForTransactionReceipt({
  //     hash: txHash,
  //     status: "FINALIZED",
  //     interval: 10000,
  //   });
  //   return receipt;
  // }

  // async resolveBet(betId) {
  //   const txHash = await this.client.writeContract({
  //     address: this.contractAddress,
  //     functionName: "resolve_bet",
  //     args: [betId],
  //   });
  //   const receipt = await this.client.waitForTransactionReceipt({
  //     hash: txHash,
  //     status: "FINALIZED",
  //     interval: 10000,
  //     retries: 20,
  //   });
  //   return receipt;
  // }

  async placeBets(userDiscordHandler, userXHandler, bet0Outcome, bet1Outcome, bet2Outcome) {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "place_bets",
      args: [userDiscordHandler, userXHandler, bet0Outcome, bet1Outcome, bet2Outcome],
    });
    const receipt = await this.client.waitForTransactionReceipt({
      hash: txHash,
      status: "ACCEPTED",
      interval: 10000,
    });
    return receipt;
  }

  async getAllUserBets(address = undefined) {
    const userBets = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_all_user_bets",
      args: [],
    });
    
    // Convert the entire Map response to a regular object
    const convertMapToObject = (mapObj) => {
      if (!(mapObj instanceof Map)) {
        return mapObj;
      }
      
      const result = {};
      mapObj.forEach((value, key) => {
        if (value instanceof Map) {
          result[key] = convertMapToObject(value);
        } else if (Array.isArray(value)) {
          result[key] = value.map(item => {
            if (item instanceof Map) {
              return convertMapToObject(item);
            }
            return item;
          });
        } else if (typeof value === 'bigint') {
          result[key] = Number(value);
        } else {
          result[key] = value;
        }
      });
      return result;
    };
    
    // Convert the entire response
    const convertedUserBets = convertMapToObject(userBets);
    
    // If address is provided, filter for that specific user
    if (address && typeof address === 'string') {
      const userAddress = address.toLowerCase();
      const filteredUserBets = {
        total_users: 1,
        user_addresses: convertedUserBets.user_addresses,
        user_bet_selections: {},
        user_handlers: {}
      };
      
      // Find the user's data
      if (convertedUserBets.user_addresses) {
        const userIndex = convertedUserBets.user_addresses.findIndex(
          addr => addr.toLowerCase() === userAddress
        );
        
        if (userIndex !== -1) {
          const userAddr = convertedUserBets.user_addresses[userIndex];
          filteredUserBets.user_bet_selections = 
            convertedUserBets.user_bet_selections[userAddr] || {};
          filteredUserBets.user_handlers = 
            convertedUserBets.user_handlers[userAddr] || {};
        }
      }
      
      return filteredUserBets;
    }
    
    return convertedUserBets;
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

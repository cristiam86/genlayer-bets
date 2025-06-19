<template>
  <div class="min-h-screen bg-gray-100 text-gray-900">
    <header class="bg-white shadow flex justify-between">
      <div class="max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">GenLayer Bets</h1>
      </div>
      <div class="max-w-7xl py-6 px-4 sm:px-6 lg:px-8 text-right">
        <div v-if="!userAddress">
          <button
            @click="createUserAccount"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Account
          </button>
        </div>
        <div v-else>
          <p class="text-lg">Your address: <Address :address="userAddress" /></p>
          <p class="text-lg">Your points: {{ userPoints }}</p>
          <button
            @click="disconnectUserAccount"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Disconnect
          </button>
        </div>
      </div>
    </header>
    <main class="mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Account Section -->

      <div class="grid grid-cols-1 md:grid-cols-10 gap-8">
        <!-- Bets List -->
        <div class="bg-white shadow overflow-hidden sm:rounded-lg col-span-7">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 class="text-lg leading-6 font-medium text-gray-900">Available Bets</h2>
          </div>
          <div class="border-t border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Resolution Date
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Your Bet
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Result
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="bet in bets" :key="bet.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ bet.title }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    <span class="truncate block">{{ bet.description }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ bet.date }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span :class="bet.has_resolved ? 'text-green-600' : 'text-yellow-600'">
                      {{ bet.has_resolved ? "Resolved" : "Open" }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span v-if="userAddress && bet.users_bets[userAddress]">
                      {{ bet.possible_outcomes[bet.users_bets[userAddress]] }}
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div v-if="bet.has_resolved">
                      <div>{{ bet.possible_outcomes[bet.outcome] }}</div>
                      <div v-if="userAddress && bet.users_bets[userAddress] !== undefined">
                        <span :class="bet.users_bets[userAddress] === bet.outcome ? 'text-green-600' : 'text-red-600'">
                          {{ bet.users_bets[userAddress] === bet.outcome ? "Won" : "Lost" }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div v-if="!bet.has_resolved">
                      <button
                        v-if="userAddress && !bet.users_bets[userAddress] && !placingBet[bet.id]"
                        @click="openPlaceBetModal(bet)"
                        class="text-indigo-600 hover:text-indigo-900"
                      >
                        Place Bet
                      </button>
                      <span v-else-if="placingBet[bet.id]" class="text-gray-500">Placing...</span>
                    </div>
                    <div v-if="resolvingBet !== bet.id && contractOwner === userAddress && bet.has_resolved === false && canResolve(bet.date)">
                      <button
                        @click="resolveBet(bet.id)"
                        class="text-green-600 hover:text-green-900"
                      >
                        Resolve
                      </button>
                    </div>
                    <div v-else-if="resolvingBet === bet.id">Resolving...</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Leaderboard -->
        <div class="bg-white shadow overflow-hidden sm:rounded-lg col-span-3">
          <div class="px-4 py-5 sm:px-6">
            <h2 class="text-lg leading-6 font-medium text-gray-900">Leaderboard</h2>
          </div>
          <div class="border-t border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rank
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Address
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Points
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(user, index) in leaderboard" :key="user.address">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ index + 1 }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Address :address="user.address" />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.points }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Place Bet Modal -->
      <div
        v-if="showPlaceBetModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center"
      >
        <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-2">Place Your Bet</h3>
          <div v-if="selectedBet">
            <p class="text-sm text-gray-600 mb-2"><strong>{{ selectedBet.title }}</strong></p>
            <p class="text-sm text-gray-500 mb-4">{{ selectedBet.description }}</p>
            <p class="text-sm text-gray-500 mb-4">Choose your prediction:</p>
            <div class="space-y-2 mb-4">
              <label
                v-for="(outcome, index) in selectedBet.possible_outcomes"
                :key="index"
                class="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
                :class="selectedOutcome === index ? 'border-blue-500 bg-blue-50' : 'border-gray-300'"
              >
                <input
                  type="radio"
                  v-model="selectedOutcome"
                  :value="index"
                  class="mr-2"
                />
                <span>{{ outcome }}</span>
              </label>
            </div>
            <div class="mt-4">
              <button
                @click="placeBet"
                :disabled="selectedOutcome === null"
                class="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Place Bet
              </button>
              <button
                @click="closePlaceBetModal"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <div class="flex items-center justify-center h-screen">
    <div class="spinner">Loading...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { account, createAccount, removeAccount } from "../services/genlayer";
import GenLayerBets from "../logic/GenLayerBets";
import Address from "./Address.vue";
// State
const resolvingBet = ref("");
const placingBet = ref({});
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const studioUrl = import.meta.env.VITE_STUDIO_URL;
const genLayerBets = new GenLayerBets(contractAddress, account, studioUrl);
const userAccount = ref(account);
const userPoints = ref(0);
const userAddress = computed(() => userAccount.value?.address);
const bets = ref([]);
const leaderboard = ref([]);
const showPlaceBetModal = ref(false);
const selectedBet = ref(null);
const selectedOutcome = ref(null);
const contractOwner = ref(null);

// Methods
const createUserAccount = async () => {
  userAccount.value = createAccount();
  genLayerBets.updateAccount(userAccount.value);  
  userPoints.value = 0;
  await loadBets();
};

const disconnectUserAccount = async () => {
  userAccount.value = null;
  removeAccount();
  userPoints.value = 0;
};

const openPlaceBetModal = (bet) => {
  selectedBet.value = bet;
  selectedOutcome.value = null;
  showPlaceBetModal.value = true;
};

const closePlaceBetModal = () => {
  showPlaceBetModal.value = false;
  selectedBet.value = null;
  selectedOutcome.value = null;
};

const loadBets = async () => {
  const allBets = await genLayerBets.getBets();
  bets.value = allBets;
};

const loadLeaderboard = async () => {
  leaderboard.value = await genLayerBets.getLeaderboard();
};

const refreshPlayerPoints = async () => {
  userPoints.value = await genLayerBets.getPlayerPoints(userAddress.value);
};

const placeBet = async () => {
  if (selectedBet.value && selectedOutcome.value !== null) {
    placingBet.value[selectedBet.value.id] = true;
    try {
      await genLayerBets.placeBet(selectedBet.value.id, selectedOutcome.value);
      await loadBets();
      closePlaceBetModal();
    } finally {
      placingBet.value[selectedBet.value.id] = false;
    }
  }
};

const resolveBet = async (betId) => {
  resolvingBet.value = betId;
  try {
    await genLayerBets.resolveBet(betId);
    await loadBets();
    await loadLeaderboard();
    await refreshPlayerPoints();
  } finally {
    resolvingBet.value = "";
  }
};

const canResolve = (betDate) => {
  const today = new Date();
  const bet = new Date(betDate);
  return today >= bet;
};

const loadOwner = async () => {
  contractOwner.value = await genLayerBets.getOwner();
};


// Initialize with some sample data
onMounted(async () => {
  await loadOwner();
  await loadBets();
  await loadLeaderboard();
  if (userAddress.value) {
    await refreshPlayerPoints();
  }
});
</script>

import { createClient, createAccount as createGenLayerAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

// Helper function to safely access localStorage only on client side
const getLocalStorageItem = (key) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorageItem = (key, value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeLocalStorageItem = (key) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

// Initialize account only on client side
let accountInstance = null;

if (typeof window !== 'undefined') {
  const accountPrivateKey = getLocalStorageItem("accountPrivateKey");
  accountInstance = accountPrivateKey ? createGenLayerAccount(accountPrivateKey) : null;
}

export const account = accountInstance;

export const createAccount = () => {
  const newAccountPrivateKey = generatePrivateKey();
  setLocalStorageItem("accountPrivateKey", newAccountPrivateKey);
  return createGenLayerAccount(newAccountPrivateKey);
};

export const removeAccount = () => {
  removeLocalStorageItem("accountPrivateKey");
};

export const client = createClient({ chain: studionet, account });

import { getContractAddress } from "@/lib/contracts";
import { Address } from "viem";
import { base, baseSepolia } from "wagmi/chains";

export const chainId = base.id;
// USDT has 6 decimals, Vault token has 18 decimals
export const USDT_DECIMALS = 6;
export const VAULT_DECIMALS = 18;
 // Get contract addresses
 export const vaultAddress = getContractAddress(chainId, 'SaveUpVault') as Address;
 export const usdtAddress = getContractAddress(chainId, 'USDT') as Address;
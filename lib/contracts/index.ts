export * from './abis/IERC20';
export * from './abis/SaveUpVault';
import { CONTRACT_ADDRESSES } from './addresses';
export * from './addresses';

// Helper function to get contract address
export function getContractAddress(chainId: number, contractName: 'USDT' | 'SaveUpVault') {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`No addresses found for chain ID ${chainId}`);
  }
  const address = addresses[contractName];
  if (!address) {
    throw new Error(`No address found for contract ${String(contractName)} on chain ID ${chainId}`);
  }
  return address;
}

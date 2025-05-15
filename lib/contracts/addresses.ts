interface ContractAddresses {
  [chainId: number]: {
    USDT: string;
    SaveUpVault: string;
  };
}

export const CONTRACT_ADDRESSES: ContractAddresses = {
  31337: {
    USDT: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    SaveUpVault: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
  },
  // Add other networks when deploying
  // 8453: { // Base
  //   USDT: '0x...',
  //   SaveUpVault: '0x...'
  // }
};

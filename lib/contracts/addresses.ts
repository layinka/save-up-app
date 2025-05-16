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
  8453: { // Base
    USDT: '0xA253F38547A0A702EB4aB22A5564Be317b9a7eB7',
    SaveUpVault: '0xeB09dCD136A0f3558Dd222a942A94a28df748f7f'
  },
  84532: { // Base Sepolia
    USDT: '0x74095AFf830Ebe635760B73fa4A7bFD18B8F6658',
    SaveUpVault: '0x551F08c05D2b140DBD304E989A9A030BfaaB9253'
  }
};

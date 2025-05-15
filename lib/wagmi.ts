import { http, createConfig } from 'wagmi'
import { base, baseSepolia, hardhat } from 'wagmi/chains'
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector'

// Local hardhat chain configuration
const localHardhat = {
  ...hardhat,
  id: 31337
}

export const config = createConfig({
  chains: [base, baseSepolia, localHardhat],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [localHardhat.id]: http('http://localhost:8545')
  },
  connectors: [
    miniAppConnector()
  ]
})
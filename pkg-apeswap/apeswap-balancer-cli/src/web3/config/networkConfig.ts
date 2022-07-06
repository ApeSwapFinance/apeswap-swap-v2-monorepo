import { Overrides } from 'ethers';
import { getEnv } from './utils';

/**
 * Configure network types here
 */
export const NETWORK_TYPE_ARRAY = <const>['bsc', 'bsc-dummy', 'bsc-testnet', 'polygon', 'polygon-testnet'];
export type NETWORK_TYPE = typeof NETWORK_TYPE_ARRAY[number];

export function checkNetwork(network: NETWORK_TYPE): void {
  if (network != undefined && !NETWORK_TYPE_ARRAY.includes(network)) {
    throw new Error(
      `checkNetwork:: "${network}" is not an accepted network. Network options include: ${NETWORK_TYPE_ARRAY}`
    );
  }
}

export function getNetworkConfig(network: NETWORK_TYPE): NetworkConfig {
  checkNetwork(network);
  const config = networkConfigs[network];
  if (config == undefined) {
    throw new Error(`getNetworkConfig:: Config for network ${network} not found!`);
  }
  return config;
}

type NetworkCategory = 'mainnet' | 'testnet';

export interface NetworkConfig {
  rpcUrl: string;
  getBlockExplorerUrl: (address: string) => string;
  networkCategory: NetworkCategory;
  txOverrides?: Overrides;
}

type NetworkConfigs = Record<NETWORK_TYPE, NetworkConfig>;

/**
 * Can add optional ethers Overrides to txOverrides
 */
const networkConfigs: NetworkConfigs = {
  bsc: {
    rpcUrl: getEnv('BSC_RPC') || 'https://bscrpc.com',
    getBlockExplorerUrl: (address: string) => `https://bscscan.com/address/${address}`,
    networkCategory: 'mainnet',
    txOverrides: {
      // gasLimit: 1e6,
      gasPrice: 5e9, // 5 Gwei
    },
  },
  'bsc-dummy': {
    rpcUrl: getEnv('BSC_RPC') || 'https://bscrpc.com',
    getBlockExplorerUrl: (address: string) => `https://bscscan.com/address/${address}`,
    networkCategory: 'mainnet',
    txOverrides: {
      // gasLimit: 1e6,
      gasPrice: 5e9, // 5 Gwei
    },
  },
  'bsc-testnet': {
    rpcUrl: '',
    getBlockExplorerUrl: (address: string) => `https://testnet.bscscan.com/address/${address}`,
    networkCategory: 'testnet',
  },
  polygon: {
    rpcUrl: '',
    getBlockExplorerUrl: (address: string) => `https://polygonscan.com/address/${address}`,
    networkCategory: 'mainnet',
  },
  'polygon-testnet': {
    rpcUrl: '',
    getBlockExplorerUrl: (address: string) => `https://mumbai.polygonscan.com/address/${address}`,
    networkCategory: 'testnet',
  },
};

import { providers, utils, Wallet, Overrides } from 'ethers';
import { getEnv, getNetworkConfig, NETWORK_TYPE } from './config';

export function getAccount(network: NETWORK_TYPE = 'bsc', accountIndex = 0): utils.HDNode {
  const { networkCategory } = getNetworkConfig(network);
  let mnemonic;
  if (networkCategory == 'mainnet') {
    mnemonic = getEnv('MAINNET_MNEMONIC', true);
  } else if (networkCategory == 'testnet') {
    mnemonic = getEnv('TESTNET_MNEMONIC', true);
  } else {
    throw new Error(`getAccount:: networkCategory ${networkCategory} not integrated.`);
  }
  return utils.HDNode.fromMnemonic(mnemonic).derivePath(`m/44'/60'/0'/0/${accountIndex}`);
}

export function getProvider(network: NETWORK_TYPE = 'bsc'): providers.JsonRpcProvider {
  return new providers.JsonRpcProvider(getNetworkConfig(network).rpcUrl);
}

export function getWallet(network: NETWORK_TYPE = 'bsc'): Wallet {
  const provider = getProvider(network);
  return new Wallet(getAccount(network), provider);
}

export function getWalletAddress(network: NETWORK_TYPE = 'bsc'): string {
  const wallet = getWallet(network);
  return wallet.address;
}

export function getTxOverrides(network: NETWORK_TYPE = 'bsc', overrides: Overrides): Overrides {
  const defaultOverrides = getNetworkConfig(network).txOverrides || {};
  return { ...defaultOverrides, ...overrides };
}

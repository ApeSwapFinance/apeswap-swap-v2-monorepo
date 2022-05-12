import { checkNetwork, NETWORK_TYPE } from './networkConfig';

export function getContractConfig(network: NETWORK_TYPE): ContractConfig {
  checkNetwork(network);
  const config = networkConfigs[network];
  if (config == undefined) {
    throw new Error(`getContractConfig:: Config for network ${network} not found!`);
  }
  return config;
}

export interface ContractConfig {
  defaultAdminAddress: string;
  vaultAddress: string;
  balancerHelpersAddress: string;
  weightedPoolFactoryAddress: string;
  weightedPool2TokensFactory: string;
  stablePoolFactoryAddress: string;
  stablePhantomPoolFactory: string;
  olaLinearPoolFactoryAddress: string;
}

type ContractConfigs = Record<NETWORK_TYPE, ContractConfig>;

/**
 * Can add optional ethers Overrides to txOverrides
 */
const networkConfigs: ContractConfigs = {
  bsc: {
    defaultAdminAddress: '0x50Cf6cdE8f63316b2BD6AACd0F5581aEf5dD235D', // General Admin GSafe
    vaultAddress: '0x000a9e000a35f2cBbE4326578E19dd8Fb4913719',
    balancerHelpersAddress: '0x5DED4a015CDF95dFEF5EFa1ddC9b7A836712c7fA',
    weightedPoolFactoryAddress: '0x344D55F8Ff586a0050FBb45C027A2806CD728197',
    weightedPool2TokensFactory: '0x5229525baD2Ffef104Be760dCdfa9a2439c5a93B',
    stablePoolFactoryAddress: '0x442952B47548451555e2E0D2Bd35672Eb6156d9b',
    stablePhantomPoolFactory: '0x4115ab17b1AB594fF7e491A65e6A892A88bEC494',
    olaLinearPoolFactoryAddress: '0x6f1C7f3393202C6a8A6654c538CD5dA8741267e5',
  },
  'bsc-dummy': {
    // Ola Dummy Unitroller
    // https://bscscan.com/address/0x89757E0AAC12F25c4a14154FbF711655E91F330f#readProxyContract
    // Ola Dummy oBUSD
    // https://bscscan.com/address/0x2f76bA39859d20b4138cC10f7400e81990504B36
    // Ola Dummy oBNB
    // https://bscscan.com/address/0xecE0F0E067cB22F9D01989d33E36D1A6ef6FcE81
    defaultAdminAddress: '0x6c905b4108A87499CEd1E0498721F2B831c6Ab13', // General Admin BSC
    vaultAddress: '0x42B7888FFf938C54faeDF52485C8323c4Fc8C99B',
    balancerHelpersAddress: '0x3A94927bA5Da97623357c2FD2bd03b154703cD66',
    weightedPoolFactoryAddress: '',
    weightedPool2TokensFactory: '',
    stablePoolFactoryAddress: '',
    stablePhantomPoolFactory: '',
    olaLinearPoolFactoryAddress: '0x720a656C9589ebfd6d638DcE4629DCE368042790',
  },
  'bsc-testnet': {
    defaultAdminAddress: '',
    vaultAddress: '0x000a9e000a35f2cBbE4326578E19dd8Fb4913719',
    balancerHelpersAddress: '',
    weightedPoolFactoryAddress: '',
    weightedPool2TokensFactory: '',
    stablePoolFactoryAddress: '',
    stablePhantomPoolFactory: '',
    olaLinearPoolFactoryAddress: '',
  },
  polygon: {
    defaultAdminAddress: '',
    vaultAddress: '',
    balancerHelpersAddress: '',
    weightedPoolFactoryAddress: '',
    weightedPool2TokensFactory: '',
    stablePoolFactoryAddress: '',
    stablePhantomPoolFactory: '',
    olaLinearPoolFactoryAddress: '',
  },
  'polygon-testnet': {
    defaultAdminAddress: '',
    vaultAddress: '',
    balancerHelpersAddress: '',
    weightedPoolFactoryAddress: '',
    weightedPool2TokensFactory: '',
    stablePoolFactoryAddress: '',
    stablePhantomPoolFactory: '',
    olaLinearPoolFactoryAddress: '',
  },
};

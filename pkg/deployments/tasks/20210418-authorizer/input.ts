import { Network } from '../../src/types';

export type AuthorizerDeployment = {
  admin: string;
};

const authorizerNetworkDeployment: Record<Network, AuthorizerDeployment> = {
  goerli: {
    admin: '0x',
  },
  kovan: {
    admin: '0x',
  },
  mainnet: {
    admin: '0x',
  },
  rinkeby: {
    admin: '0x',
  },
  ropsten: {
    admin: '0x',
  },
  polygon: {
    admin: '0x',
  },
  arbitrum: {
    admin: '0x',
  },
  dev: {
    admin: '0x6207ed574152496c9B072C24FD87cE9cd9E17320',
  },
  bsc: {
    admin: '0x50Cf6cdE8f63316b2BD6AACd0F5581aEf5dD235D', // General Admin BSC GSafe
  },
  'bsc-dummy': {
    admin: '0xb5FF1896Fbc20CA130cE4736878aac01CA852b29', // Timelock Executor BSC GSafe
  },
  'bsc-testnet': {
    admin: '0xE375D169F8f7bC18a544a6e5e546e63AD7511581',
  },
};

export default authorizerNetworkDeployment;

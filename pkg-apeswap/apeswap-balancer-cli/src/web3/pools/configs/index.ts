import { BigNumberish } from 'ethers';
import { NETWORK_TYPE } from '../../config';

export type PoolType = 'OlaLinearPool' | 'WeightedPool' | 'StablePhantomPool';

export interface BasePoolConfig {
  network: NETWORK_TYPE;
  name: string;
  symbol: string;
  poolType: PoolType;
  poolId?: string; // Pass a poolId if there is already a pool deployed
  swapFeePercent: BigNumberish;
  fromInternalBalance: boolean;
  owner: string;
  tokens: {
    [key: string]: {
      initialBalance: BigNumberish;
      allowance: BigNumberish;
    };
  };
}

export interface WeightedPoolConfig extends BasePoolConfig {
  poolType: 'WeightedPool';
  tokens: BasePoolConfig['tokens'] & {
    [key: string]: {
      weight: BigNumberish;
    };
  };
}

export interface StablePhantomPoolConfig extends BasePoolConfig {
  poolType: 'StablePhantomPool';
  amplificationParameter: BigNumberish;
  tokens: BasePoolConfig['tokens'] & {
    [key: string]: {
      rateProvider: string;
      tokenRateCacheDuration: string;
    };
  };
}

export interface OlaLinearPoolConfig extends BasePoolConfig {
  poolType: 'OlaLinearPool';
  upperTarget: BigNumberish;
  tokens: BasePoolConfig['tokens'] & {
    [key: string]: {
      isWrappedToken: boolean;
    };
  };
}

import {
  BatchSwap,
  BatchSwapStep,
  JoinPoolRequest,
  StablePoolEncoder,
  SwapKind,
  WeightedPoolEncoder,
} from '@balancer-labs/balancer-js';
import { BigNumber, BigNumberish, ContractReceipt } from 'ethers';
import { queryBatchSwap, sendBatchSwap, sendJoinPool } from '../vault';
import { BasePoolConfig, OlaLinearPoolConfig, StablePhantomPoolConfig, WeightedPoolConfig } from './configs';
import { processBatchSwapLimits } from './swaps';
import { getPoolAddressFromPoolId } from './utils';
import { MAX_UINT112 } from '@balancer-labs/v2-helpers/src/constants';
import { sortAddressObject } from '../utils';
import { getWalletAddress } from '../provider';

export async function joinInitPool(poolId: string, poolConfig: BasePoolConfig): Promise<ContractReceipt> {
  const poolType = poolConfig.poolType;
  console.log(`${joinInitPool.name}:: Joining with ${poolType} config`);
  switch (poolType) {
    case 'OlaLinearPool':
      // Phantom Pools use a Swap to join a pool
      return joinInitLinearPool(poolId, poolConfig, 1);
      break;
    case 'StablePhantomPool':
      return joinInitStablePhantomPool(poolId, poolConfig as StablePhantomPoolConfig);
      break;
    case 'WeightedPool':
      // Weighted Pools use a Join to join a pool
      return joinInitWeightedPool(poolId, poolConfig as WeightedPoolConfig);
      break;
    default:
      throw new Error(`${joinInitPool.name}:: configName ${poolType} not integrated.`);
  }
}

async function joinInitWeightedPool(poolId: string, poolConfig: WeightedPoolConfig): Promise<ContractReceipt> {
  const joinPoolRequest = await joinInitWeightedPoolData(poolConfig);
  const contractReceipt = await sendJoinPool(poolConfig.network, poolId, joinPoolRequest);
  return contractReceipt;
}

function joinInitWeightedPoolData(poolConfig: BasePoolConfig): JoinPoolRequest {
  // NOTE: Tokens must be in numerical order.
  const assets = Object.keys(poolConfig.tokens);
  const maxAmountsIn: BigNumberish[] = [];
  for (let index = 0; index < assets.length; index++) {
    const token = poolConfig.tokens[assets[index]];
    maxAmountsIn.push(token.initialBalance);
  }

  const userData = WeightedPoolEncoder.joinInit(maxAmountsIn);

  /**
   * `userData` field is important to set, but depends on pool type
   * https://dev.balancer.fi/resources/joins-and-exits/pool-joins#userdata
   */
  const joinPoolRequest: JoinPoolRequest = {
    assets: assets,
    maxAmountsIn: maxAmountsIn,
    userData,
    fromInternalBalance: false,
  };

  // NOTE: Not processing limits
  return joinPoolRequest;
}

async function joinInitLinearPool(
  poolId: string,
  poolConfig: BasePoolConfig,
  slippageTolerancePercent = 1
): Promise<ContractReceipt> {
  const accountAddress = getWalletAddress();
  const joinInitBatchSwap = await joinInitLinearPoolData(poolId, poolConfig, accountAddress, slippageTolerancePercent);
  const contractReceipt = await sendBatchSwap(poolConfig.network, joinInitBatchSwap);
  return contractReceipt;
}

async function joinInitLinearPoolData(
  poolId: string,
  poolConfig: BasePoolConfig,
  sender: string,
  slippageTolerancePercent = 1
): Promise<BatchSwap> {
  // NOTE: The pool address is the first part of the poolId. We need to add this token address to the assets to join this phantom pool
  const phantomBptAddress = getPoolAddressFromPoolId(poolId);

  const assets = Object.keys(poolConfig.tokens);
  const swaps: BatchSwapStep[] = [];
  for (let index = 0; index < assets.length; index++) {
    const token = poolConfig.tokens[assets[index]];
    if (token.initialBalance > 0) {
      swaps.push({
        poolId,
        assetInIndex: index,
        // NOTE: Adding the Phantom Pool Token below for the output index
        assetOutIndex: assets.length,
        amount: token.initialBalance,
        // NOTE: For all current Balancer pools this can be left empty. (Needed for JOINs though!)
        // https://dev.balancer.fi/resources/swaps/batch-swaps
        userData: '0x',
      });
    }
  }
  // NOTE: Adding phantom token to swap assets as this is the asset we are wanting to receive
  assets.push(phantomBptAddress);
  // Initialize for now
  const limits: BigNumberish[] = Array(assets.length).fill('0');

  const joinInSwap: BatchSwap = {
    kind: SwapKind.GivenIn,
    swaps,
    assets,
    funds: {
      sender: sender,
      fromInternalBalance: false,
      recipient: sender,
      toInternalBalance: false,
    },
    limits,
    deadline: BigNumber.from('999999999999999999'),
  };

  const batchSwapWithLimits = await processBatchSwapLimits(poolConfig.network, joinInSwap, slippageTolerancePercent);

  return batchSwapWithLimits;
}

async function joinInitStablePhantomPool(
  poolId: string,
  poolConfig: StablePhantomPoolConfig
): Promise<ContractReceipt> {
  const joinInitPoolRequest = await joinInitStablePhantomPoolData(poolConfig);
  const contractReceipt = await sendJoinPool(poolConfig.network, poolId, joinInitPoolRequest);
  return contractReceipt;
}

function joinInitStablePhantomPoolData(poolConfig: StablePhantomPoolConfig): JoinPoolRequest {
  /**
   * When performing an INIT join on a StablePhantom Pool, you must include the BPT of the pool itself as one of the tokens you provide.
   * https://dev.balancer.fi/resources/deploy-pools-from-factory/creation/stablephantom-pool
   */
  if (!poolConfig.poolId) {
    throw new Error(`${joinInitStablePhantomPoolData.name}:: poolId missing from config.`);
  }
  const bptAddress = getPoolAddressFromPoolId(poolConfig.poolId);
  // NOTE: Tokens must be in numerical order. Currently they are sorted automatically when pulling from a JSON file.
  let tokens = poolConfig.tokens;
  tokens[bptAddress] = { initialBalance: MAX_UINT112, allowance: '0', rateProvider: '0x', tokenRateCacheDuration: '0' };
  tokens = sortAddressObject(tokens);

  const assets = Object.keys(tokens);
  const maxAmountsIn: BigNumberish[] = [];

  for (let index = 0; index < assets.length; index++) {
    const token = tokens[assets[index]];
    maxAmountsIn.push(token.initialBalance);
  }

  const userData = StablePoolEncoder.joinInit(maxAmountsIn);

  /**
   * `userData` field is important to set, but depends on pool type
   * https://dev.balancer.fi/resources/joins-and-exits/pool-joins#userdata
   */
  const joinPoolRequest: JoinPoolRequest = {
    assets: assets,
    maxAmountsIn: maxAmountsIn,
    userData,
    fromInternalBalance: false,
  };

  // NOTE: Not processing limits
  return joinPoolRequest;
}

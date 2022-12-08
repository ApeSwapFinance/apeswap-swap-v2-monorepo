import { BatchSwap } from '@balancer-labs/balancer-js';
import { BigNumber } from 'ethers';
import { NETWORK_TYPE } from '../config';
import { queryBatchSwap } from '../vault';

/**
 * Query the vault for outputs and use them to adjust for the proper slippage tolerance
 *
 * @param network
 * @param batchSwap Tokens in batchSwap must be in numerical order
 * @param slippageTolerancePercent
 */
export async function processBatchSwapLimits(
  network: NETWORK_TYPE,
  initialBatchSwap: BatchSwap,
  slippageTolerancePercent = 0
): Promise<BatchSwap> {
  const batchSwapEstimates: BigNumber[] = await queryBatchSwap(network, initialBatchSwap);
  // Deep copy BatchSwap
  const batchSwapWithLimits = JSON.parse(JSON.stringify(initialBatchSwap)) as BatchSwap;
  slippageTolerancePercent =
    slippageTolerancePercent > 100 ? 100 : slippageTolerancePercent < 0 ? 0 : slippageTolerancePercent;

  for (let index = 0; index < batchSwapEstimates.length; index++) {
    const estimates = batchSwapEstimates[index] as BigNumber;

    if (estimates.lt(BigNumber.from('0'))) {
      slippageTolerancePercent *= -1;
    }
    batchSwapWithLimits.limits[index] = estimates
      .mul(BigNumber.from(100 + slippageTolerancePercent))
      .div(BigNumber.from(100));
  }

  return batchSwapWithLimits;
}

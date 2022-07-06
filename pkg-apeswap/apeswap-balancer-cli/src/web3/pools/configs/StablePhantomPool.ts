import { parseUnits } from 'ethers/lib/utils';
import { StablePhantomPoolConfig } from '.';
import { NETWORK_TYPE } from '../../config';
/**
 * Set owner as DELEGATE_OWNER to delegate pool ownership to other
 * addresses such as governance or Gauntlet.
 * Will allow the pool to be updated through the Authorizer contract.
 * https://dev.balancer.fi/resources/deploy-pools-from-factory/creation#dynamic-fees
 */
import { DELEGATE_OWNER } from '../../config/constants';

/**
 * Resources:
 * How to perform INIT join on a StablePhantom Pool
 * https://dev.balancer.fi/resources/deploy-pools-from-factory/creation/stablephantom-pool
 */

/**
 * // NOTE: bsc-dummy configuration
 */
// Setters for all pools below
const network: NETWORK_TYPE = 'bsc-dummy';
const owner = DELEGATE_OWNER; // Pools are controller through the Authorizer contract
// TODO: Going to update this likely
const swapFeePercent = parseUnits('0.00005'); // .005%
// TODO: Going to update this likely
// May be useful. It looks like Balancer is currently set at 1472
// uint256 internal constant _MIN_AMP = 1;
// uint256 internal constant _MAX_AMP = 5000;
const amplificationParameter = '100';
const initialBalance = parseUnits('1');
// TODO: Going to update this likely
const tokenRateCacheDuration = '1000';

/**
 * // NOTE: For the rateProviders in LinearPools to work, there must be a balance in the pool.
 */
const config: StablePhantomPoolConfig[] = [
  {
    poolId: '0x4c6061c46eb89ec670deb69a176a7799c3b4141c000000000000000000000016',
    network,
    name: 'ApeSwap Ola Boosted Stable Pool (USD)',
    symbol: 'ab-o-USD',
    poolType: 'StablePhantomPool',
    swapFeePercent,
    fromInternalBalance: false,
    owner,
    amplificationParameter,
    tokens: {
      //
      '0x3Ef0Ac76E08a138E97dC5575190b4172C799ee7a': {
        initialBalance,
        allowance: -1,
        rateProvider: '0x3Ef0Ac76E08a138E97dC5575190b4172C799ee7a', // Using same rate provider as token
        tokenRateCacheDuration,
      },
      //
      '0xb3d01a6F458287f8c6740032D31cB7344eB27cc0': {
        initialBalance,
        allowance: -1,
        rateProvider: '0xb3d01a6F458287f8c6740032D31cB7344eB27cc0', // Using same rate provider as token
        tokenRateCacheDuration,
      },
      //
      '0xc26d14316EBaEe1540Be6b2f18a699c3b2Fd048F': {
        initialBalance,
        allowance: -1,
        rateProvider: '0xc26d14316EBaEe1540Be6b2f18a699c3b2Fd048F', // Using same rate provider as token
        tokenRateCacheDuration,
      },
    },
  },
];

export default config;

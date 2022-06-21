import { parseUnits } from 'ethers/lib/utils';
import { OlaLinearPoolConfig } from '.';
import { NETWORK_TYPE } from '../../config';
/**
 * Set owner as DELEGATE_OWNER to delegate pool ownership to other
 * addresses such as governance or Gauntlet.
 * Will allow the pool to be updated through the Authorizer contract.
 * https://dev.balancer.fi/resources/deploy-pools-from-factory/creation#dynamic-fees
 */
import { DELEGATE_OWNER } from '../../config/constants';

/**
 * // NOTE: bsc-dummy configuration
 */
// Setters for all pools below
const network: NETWORK_TYPE = 'bsc-dummy';
const owner = DELEGATE_OWNER; // Pools are controller through the Authorizer contract
const swapFeePercent = parseUnits('0.0005'); // .05%;
const upperTarget = parseUnits('100000');

const config: OlaLinearPoolConfig[] = [
  {
    poolId: '',
    network,
    name: 'ApeSwap Ola Boosted Pool (BUSD)',
    symbol: 'ab-o-BUSD',
    poolType: 'OlaLinearPool',
    swapFeePercent,
    fromInternalBalance: false,
    owner,
    upperTarget,
    tokens: {
      // BUSD
      '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56': {
        isWrappedToken: false,
        initialBalance: parseUnits('1'),
        allowance: -1,
      },
      // oBUSD
      '0x0096B6B49D13b347033438c4a699df3Afd9d2f96': {
        isWrappedToken: true,
        initialBalance: '0',
        allowance: -1,
      },
    },
  },
  {
    poolId: '',
    network,
    name: 'ApeSwap Ola Boosted Pool (USDT)',
    symbol: 'ab-o-USDT',
    poolType: 'OlaLinearPool',
    swapFeePercent,
    fromInternalBalance: false,
    owner,
    upperTarget,
    tokens: {
      // USDT
      '0x55d398326f99059fF775485246999027B3197955': {
        isWrappedToken: false,
        initialBalance: parseUnits('1'),
        allowance: -1,
      },
      // oUSDT
      '0xdBFd516D42743CA3f1C555311F7846095D85F6Fd': {
        isWrappedToken: true,
        initialBalance: '0',
        allowance: -1,
      },
    },
  },
  {
    poolId: '',
    network,
    name: 'ApeSwap Ola Boosted Pool (USDC)',
    symbol: 'ab-o-USDC',
    poolType: 'OlaLinearPool',
    swapFeePercent,
    fromInternalBalance: false,
    owner,
    upperTarget,
    tokens: {
      // USDC
      '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': {
        isWrappedToken: false,
        initialBalance: parseUnits('1'),
        allowance: -1,
      },
      // oUSDC
      '0x91B66a9Ef4f4CAD7F8AF942855C37Dd53520f151': {
        isWrappedToken: true,
        initialBalance: '0',
        allowance: -1,
      },
    },
  },
];

export default config;

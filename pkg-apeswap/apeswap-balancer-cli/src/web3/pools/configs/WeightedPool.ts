import { parseUnits } from 'ethers/lib/utils';
import { WeightedPoolConfig } from '.';
import { NETWORK_TYPE } from '../../config';
import { DELEGATE_OWNER } from '../../config/constants';

/**
 * // NOTE: bsc-dummy configuration
 */
// Setters for all pools below
const network: NETWORK_TYPE = 'bsc-dummy';
const owner = DELEGATE_OWNER; // Pools are controller through the Authorizer contract
const swapFeePercent = parseUnits('0.003'); // .3%

const config: WeightedPoolConfig[] = [
  {
    poolId: '0xfa872c3b34ca355f23e41fe7306126795ba8d8cd000200000000000000000018',
    network,
    name: 'ApeSwap Weighted WBNB/Stable USD',
    symbol: 'WBNB/ab-o-USD',
    poolType: 'WeightedPool',
    swapFeePercent,
    fromInternalBalance: false,
    owner,
    tokens: {
      // BSC bb-o-USD
      '0x4c6061c46eb89ec670deb69a176a7799c3b4141c': {
        weight: parseUnits('0.8'),
        initialBalance: parseUnits('1'),
        allowance: -1,
      },
      // BSC WBNB
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c': {
        weight: parseUnits('0.2'),
        initialBalance: parseUnits('0.00325732899'),
        allowance: -1,
      },
    },
  },
  // {
  //   poolId: '0xdd5c400e20a4abb6eb13399e0f0566d57c243d57000100000000000000000011',
  //   network,
  //   gasSpeed: 'average',
  //   gasPriceOverride: '',
  //   name: 'Typescript Test Weighted Pool',
  //   symbol: 'TTWP',
  //   poolType: 'WeightedPool',
  //   swapFeePercent: parseUnits('0.003'), // .3%
  //   fromInternalBalance: false,
  //   owner: OWNER,
  //   tokens: {
  //     // BSC BANANA
  //     '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95': {
  //       weight: parseUnits('0.333333333333333333'),
  //       initialBalance: parseUnits('1', 'gwei'),
  //       allowance: -1,
  //     },
  //     // BSC BUSD
  //     '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56': {
  //       weight: parseUnits('0.333333333333333333'),
  //       initialBalance: parseUnits('1', 'gwei'),
  //       allowance: -1,
  //     },
  //     // BSC USDC
  //     '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': {
  //       weight: parseUnits('0.333333333333333334'),
  //       initialBalance: parseUnits('1', 'gwei'),
  //       allowance: -1,
  //     },
  //   },
  // },
];

export default config;

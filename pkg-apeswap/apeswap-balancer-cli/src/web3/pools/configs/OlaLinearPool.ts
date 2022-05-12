import { OlaLinearPoolConfig } from '.';
import { NETWORK_TYPE } from '../../config';
import { getContractConfig } from '../../config';
/**
 * Set owner as DELEGATE_OWNER to delegate pool ownership to other
 * addresses such as governance or Gauntlet
 * https://dev.balancer.fi/resources/deploy-pools-from-factory/creation#dynamic-fees
 */
import { DELEGATE_OWNER } from '../../constants';

import { utils } from 'ethers';
const { parseUnits } = utils; // Convert decimal value to wei value

/**
 * // NOTE: bsc-dummy configuration
 */
const NETWORK: NETWORK_TYPE = 'bsc-dummy';

const config: OlaLinearPoolConfig = {
  network: NETWORK,
  // TODO Implement
  gasSpeed: 'average',
  // TODO Implement
  gasPriceOverride: '',
  name: 'Typescript Test Ola Linear Pool',
  symbol: 'TTOLP',
  poolType: 'OlaLinearPool',
  swapFeePercent: parseUnits('0.005'), // .05%
  fromInternalBalance: false,
  owner: getContractConfig(NETWORK).defaultAdminAddress,
  upperTarget: parseUnits('100000'),
  tokens: {
    // BUSD
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56': {
      isWrappedToken: false,
      initialBalance: '1',
      allowance: -1,
    },
    // oBUSD
    '0x0096B6B49D13b347033438c4a699df3Afd9d2f96': {
      isWrappedToken: true,
      initialBalance: '0',
      allowance: -1,
    },
  },
};

export default config;

import { utils } from 'ethers';

export function getPoolAddressFromPoolId(poolId: string): string {
  if (!poolId.includes('0x')) {
    poolId = '0x' + poolId;
  }
  // The first part of the poolId is the contract address
  return utils.getAddress(poolId.slice(0, 42));
}

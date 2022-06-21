import { deployPool } from '../web3';
import { PoolType } from '../web3/pools/configs';

(async function () {
  try {
    // const poolType: PoolType = 'OlaLinearPool';
    // const poolType: PoolType = 'StablePhantomPool';
    const poolType: PoolType = 'WeightedPool';
    const poolDetails = await deployPool(poolType);
    console.dir({ poolDetails }, { depth: null });

    console.log('🎉');
    process.exit(0);
  } catch (e) {
    console.error('Error running script.');
    console.dir(e);
    process.exit(1);
  }
})();

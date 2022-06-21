import { joinPool } from '../web3';
import { PoolType } from '../web3/pools/configs';

(async function () {
  try {
    // const poolType: PoolType = 'OlaLinearPool';
    // const poolType: PoolType = 'StablePhantomPool';
    const poolType: PoolType = 'WeightedPool';
    const joinDetails = await joinPool(poolType);
    console.dir({ joinDetails }, { depth: null });

    console.log('🎉');
    process.exit(0);
  } catch (e) {
    console.error('Error running script.');
    console.dir(e, { depth: null });
    process.exit(1);
  }
})();

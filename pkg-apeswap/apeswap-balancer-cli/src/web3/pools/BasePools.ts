import { ContractReceipt, Contract } from 'ethers';
import { getWallet, getProvider } from '../provider';
import OlaLinearPoolFactory from './OlaLinearPoolFactory';
import StablePhantomPoolFactory from './StablePhantomPoolFactory';
import { addressObjectIsSorted, logHeader, sortAddressObject } from '../utils';
import { PoolType, WeightedPoolConfig, StablePhantomPoolConfig, OlaLinearPoolConfig, BasePoolConfig } from './configs/';
import { hasSufficientERC20Balance, approveERC20Transfers } from '../tokens';
import { Interface } from 'ethers/lib/utils';
import { getContractConfig, NETWORK_TYPE } from '../config';
import { joinInitPool } from './joins';
import { getContractReceiptEvents, pollContractRead } from '../txManager';
import WeightedPoolFactory from './WeightedPoolFactory';
import WeightedPool2TokensFactory from './WeightedPool2TokensFactory';
import { getPoolAddressFromPoolId } from './utils';

/**
 * Dynamically import pool config file based on pool configuration name
 *
 * @param configName
 * @returns
 */
async function getPoolConfigs(configName: PoolType): Promise<BasePoolConfig[]> {
  // Dynamically import configuration
  const poolConfigs = (await import(`./configs/${configName}`)).default as BasePoolConfig[];

  for (const poolConfig of poolConfigs) {
    const tokens = poolConfig.tokens;
    // Ensure tokens are sorted
    if (!addressObjectIsSorted(tokens)) {
      console.log(
        `${getPoolConfigs.name}:: 'tokens' are not sorted in numerical order in poolConfig ${configName}. Processing sort now.`
      );
      poolConfig.tokens = sortAddressObject(tokens);
    }
  }

  return poolConfigs;
}

// eslint-disable-next-line
export async function joinPool(configName: PoolType) {
  // Dynamically import configuration
  const poolConfigs = await getPoolConfigs(configName);
  const joinDetails: { contractReceipt: ContractReceipt; poolId: string | undefined }[] = [];

  logHeader('Step 1: Check for poolId in config');
  for (const poolConfig of poolConfigs) {
    // Check that poolId exists before
    getPoolIdFromConfig(poolConfig);
  }

  logHeader('Step 2: Check Token Balances');
  for (const poolConfig of poolConfigs) {
    console.log(`Checking token balance of tokens ${Object.keys(poolConfig.tokens)}`);
    await hasSufficientERC20Balance(poolConfig);
  }

  logHeader('Step 3: Approve Token Balances');
  for (const poolConfig of poolConfigs) {
    await approveERC20Transfers(poolConfig);
  }

  logHeader('Step 4: Add Initial Tokens to Pool');
  for (const poolConfig of poolConfigs) {
    const poolId = getPoolIdFromConfig(poolConfig);
    // Create new pool
    console.log(`${joinInitPool.name}:: Joining with ${configName} config`);

    const contractReceipt = await joinInitPool(poolId, poolConfig);
    joinDetails.push({ contractReceipt, poolId });
  }

  return joinDetails;
}

interface PoolDeployDetails {
  poolName: string;
  poolSymbol: string;
  poolAddress: string | undefined;
  poolId: string | undefined;
}

/**
 * Create a Balancer Pool from a pool config
 *
 * @param configName Name of pool config
 */
// eslint-disable-next-line
export async function deployPool(configName: PoolType) {
  // Dynamically import configuration
  const poolConfigs = await getPoolConfigs(configName);
  const poolDetails: PoolDeployDetails[] = [];

  for (const poolConfig of poolConfigs) {
    logHeader(`Deploying Pool: ${poolConfig.name}`);
    logHeader('Step 1: Create Pool in Factory');
    let poolAddress, poolId;
    if (!poolConfig.poolId) {
      console.log(`${deployPool.name}:: poolId not found in config, deploying new pool.`);
      let poolDeploy, poolFactory;

      // Create new pool
      console.log(`${deployPool.name}:: Deploying pool with ${configName} config`);
      switch (configName) {
        case 'OlaLinearPool':
          poolFactory = new OlaLinearPoolFactory(getWallet(poolConfig.network), {
            network: poolConfig.network,
            address: getContractConfig(poolConfig.network).olaLinearPoolFactoryAddress,
          });
          poolDeploy = await poolFactory.createPool(poolConfig as OlaLinearPoolConfig);
          break;
        case 'StablePhantomPool':
          poolFactory = new StablePhantomPoolFactory(getWallet(poolConfig.network), {
            network: poolConfig.network,
            address: getContractConfig(poolConfig.network).stablePhantomPoolFactory,
          });
          poolDeploy = await poolFactory.createPool(poolConfig as StablePhantomPoolConfig);
          break;
        case 'WeightedPool':
          if (Object.keys(poolConfig.tokens).length == 2) {
            poolFactory = new WeightedPool2TokensFactory(getWallet(poolConfig.network), {
              network: poolConfig.network,
              address: getContractConfig(poolConfig.network).weightedPool2TokensFactory,
            });
            poolDeploy = await poolFactory.createPool(poolConfig as WeightedPoolConfig);
          } else {
            poolFactory = new WeightedPoolFactory(getWallet(poolConfig.network), {
              network: poolConfig.network,
              address: getContractConfig(poolConfig.network).weightedPoolFactoryAddress,
            });
            poolDeploy = await poolFactory.createPool(poolConfig as WeightedPoolConfig);
          }
          break;
        default:
          throw new Error(`${deployPool.name}:: configName ${configName} not integrated.`);
      }

      if (poolDeploy) {
        poolAddress = getPoolAddressFromCreationReceipt(poolDeploy.contractReceipt);
        poolId = await getPoolIdFromAddress(poolConfig.network, poolAddress || '');
        console.log(`Creation constructor arguments: ${poolDeploy.encodedArgs}`);
      }
    } else {
      console.log(`deployPool:: poolId found in config, skipping deployment step.`);
      poolId = poolConfig.poolId;
      poolAddress = getPoolAddressFromPoolId(poolId);
    }

    poolDetails.push({ poolName: poolConfig.name, poolSymbol: poolConfig.symbol, poolAddress, poolId });
  }

  return poolDetails;
}

async function getPoolIdFromAddress(network: NETWORK_TYPE, poolAddress: string): Promise<string> {
  const poolInterface = new Interface(['function getPoolId() returns (bytes32)']);
  const poolContract = new Contract(poolAddress, poolInterface, getProvider(network));
  // eslint-disable-next-line
  // @ts-ignore
  const poolId: string = await pollContractRead(poolContract.callStatic.getPoolId, []);
  return poolId;
}

function getPoolIdFromConfig(poolConfig: BasePoolConfig) {
  const poolId = poolConfig.poolId;
  if (!poolId) {
    throw new Error(`${getPoolIdFromConfig.name}:: No poolId found in poolConfig: ${poolConfig.name}`);
  }
  return poolId;
}

function getPoolAddressFromCreationReceipt(contractReceipt: ContractReceipt): string | undefined {
  const eventName = 'PoolCreated';
  const events = getContractReceiptEvents(contractReceipt, eventName);

  if (!events.length) {
    console.dir({ contractReceipt });
    throw new Error(`${getPoolAddressFromCreationReceipt.name}:: No ${eventName} event found in contract receipt.`);
  } else if (events.length > 1) {
    console.log(
      `${getPoolAddressFromCreationReceipt.name}:: Found more than one event related to "PoolCreated". Taking the first one.`
    );
  }
  const poolContractAddress = events[0]?.args?.pool;
  return poolContractAddress;
}

import { constants, providers, Wallet, utils, BigNumberish } from 'ethers';
import { Contract } from '@ethersproject/contracts';
// import OlaLinearPoolABI from '@ape.swap/v2-deployments/tasks/20220427-ola-linear-pool/abi/OlaLinearPool.json';
import StablePhantomPoolFactoryABI from '@ape.swap/v2-deployments/tasks/20211208-stable-phantom-pool/abi/StablePhantomPoolFactory.json';
// import { OlaLinearPool } from '@balancer-labs/typechain/dist/OlaLinearPool';
import { StablePhantomPoolFactory as StablePhantomPoolFactoryContract } from '@balancer-labs/typechain/dist/StablePhantomPoolFactory';
import { StablePhantomPoolConfig } from './configs';
import { NETWORK_TYPE } from '../config';
import { handleContractTx } from '../txManager';

interface ContractConfig {
  network?: NETWORK_TYPE;
  address?: string;
}

// TODO: Setup BasePoolFactory interface
export default class StablePhantomPoolFactory {
  factoryContract: StablePhantomPoolFactoryContract;
  network: NETWORK_TYPE;
  canSign = false;

  constructor(
    signerOrProvider: Wallet | providers.JsonRpcProvider,
    { network = 'bsc', address = constants.AddressZero }: ContractConfig
  ) {
    if (signerOrProvider instanceof Wallet) {
      this.canSign = true;
    }
    this.factoryContract = (new Contract(
      address,
      StablePhantomPoolFactoryABI,
      signerOrProvider
    ) as unknown) as StablePhantomPoolFactoryContract;
    this.network = network;
  }

  canSignTxs(): void {
    if (!this.canSign) {
      throw new Error(`Vault:: Signer not provided when creating contract which only allows for read calls.`);
    }
  }

  getFactoryContract(): StablePhantomPoolFactoryContract {
    return this.factoryContract;
  }

  private getTokensFromConfig(poolConfig: StablePhantomPoolConfig) {
    const configTokens = poolConfig.tokens;

    const tokens = [];
    const rateProviders = [];
    const tokenRateCacheDurations = [];

    for (const tokenAddress in configTokens) {
      const tokenDetails = configTokens[tokenAddress];
      tokens.push(tokenAddress);
      rateProviders.push(tokenDetails.rateProvider);
      tokenRateCacheDurations.push(tokenDetails.tokenRateCacheDuration);
    }

    return { tokens, rateProviders, tokenRateCacheDurations };
  }

  /**
   * Create a PhantomStablePool from the Pool Factory
   *
   * @param {StablePhantomPoolConfig} stablePhantomPoolConfig
   */
  // eslint-disable-next-line
  async createPool(poolConfig: StablePhantomPoolConfig) {
    const { tokens, rateProviders, tokenRateCacheDurations } = this.getTokensFromConfig(poolConfig);

    const { pauseWindowDuration, bufferPeriodDuration } = await this.factoryContract.getPauseConfiguration();

    const contractReceipt = await handleContractTx(
      this.factoryContract.create,
      [
        poolConfig.name, // string memory name,
        poolConfig.symbol, // string memory symbol,
        tokens, // IERC20[] memory tokens,
        poolConfig.amplificationParameter, // uint256 amplificationParameter,
        rateProviders, // IRateProvider[] memory rateProviders,
        tokenRateCacheDurations, // uint256[] memory tokenRateCacheDurations,
        poolConfig.swapFeePercent, // uint256 swapFeePercentage,
        poolConfig.owner, // address owner
      ],
      { network: poolConfig.network }
    );

    const encodedArgs = await this.getPoolCreationArguments(poolConfig, pauseWindowDuration, bufferPeriodDuration);

    /**
     * Provided encoded constructor arguments for deployed pool
     */
    return { contractReceipt, encodedArgs };
  }

  async getPoolCreationArguments(
    stablePhantomPoolConfig: StablePhantomPoolConfig,
    pauseWindowDuration: BigNumberish,
    bufferPeriodDuration: BigNumberish
  ): Promise<string> {
    const { tokens, rateProviders, tokenRateCacheDurations } = this.getTokensFromConfig(stablePhantomPoolConfig);

    const vaultAddress = await this.factoryContract.getVault();

    const encodedArgs = utils.defaultAbiCoder.encode(
      [
        'address',
        'string',
        'string',
        'address[]',
        'address[]',
        'uint256[]',
        'uint256',
        'uint256',
        'uint256',
        'address',
      ],
      [
        vaultAddress, // getVault(),
        stablePhantomPoolConfig.name, // name,
        stablePhantomPoolConfig.symbol, // symbol,
        tokens, // tokens,
        rateProviders, // rateProviders,
        tokenRateCacheDurations, // tokenRateCacheDurations
        stablePhantomPoolConfig.swapFeePercent, // swapFeePercentage,
        pauseWindowDuration, // pauseWindowDuration,
        bufferPeriodDuration, // bufferPeriodDuration,
        stablePhantomPoolConfig.owner, // owner
      ]
    );
    return encodedArgs;
  }

  async getCreationCode(): Promise<string> {
    return await this.factoryContract.getCreationCode();
  }
}

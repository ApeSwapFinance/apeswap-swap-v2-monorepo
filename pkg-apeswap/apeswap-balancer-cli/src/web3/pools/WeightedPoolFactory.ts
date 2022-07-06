import { constants, providers, Wallet, utils, BigNumberish } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import WeightedPoolFactoryABI from '@ape.swap/v2-deployments/tasks/20210418-weighted-pool/abi/WeightedPoolFactory.json';
import { WeightedPoolFactory as WeightedPoolFactoryContract } from '@balancer-labs/typechain/dist/WeightedPoolFactory';
import { WeightedPoolConfig } from './configs';
import { NETWORK_TYPE } from '../config';
import { handleContractTx } from '../txManager';

interface ContractConfig {
  network?: NETWORK_TYPE;
  address?: string;
}

export default class WeightedPoolFactory {
  factoryContract: WeightedPoolFactoryContract;
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
      WeightedPoolFactoryABI,
      signerOrProvider
    ) as unknown) as WeightedPoolFactoryContract;
    this.network = network;
  }

  canSignTxs(): void {
    if (!this.canSign) {
      throw new Error(`Vault:: Signer not provided when creating contract which only allows for read calls.`);
    }
  }

  getWeightedPoolFactoryContract(): WeightedPoolFactoryContract {
    return this.factoryContract;
  }

  // NOTE: Newer WeightPools have the concept of `address[] memory assetManagers` which would change the creation and arguments of the below functions:
  // https://github.com/ApeSwapFinance/apeswap-swap-v2-monorepo/blob/main/pkg/pool-weighted/contracts/WeightedPoolFactory.sol#L33
  // Pools used in this library were deployed from the `20210418-weighted-pool` deployment and don't include `address[] memory assetManagers`:
  // https://github.com/ApeSwapFinance/apeswap-swap-v2-monorepo/blob/main/pkg/deployments/tasks/20210418-weighted-pool/readme.md#L5
  private getTokensFromConfig(poolConfig: WeightedPoolConfig) {
    const configTokens = poolConfig.tokens;

    const tokens = [];
    const weights = [];

    for (const tokenAddress in configTokens) {
      const tokenDetails = configTokens[tokenAddress];
      tokens.push(tokenAddress);
      weights.push(tokenDetails.weight);
    }

    return { tokens, weights };
  }

  /**
   * Create a WeightedPoolConfig from the Pool Factory
   *
   * @param {WeightedPoolConfig} poolConfig
   */
  // eslint-disable-next-line
  async createPool(poolConfig: WeightedPoolConfig) {
    const { tokens, weights } = this.getTokensFromConfig(poolConfig);

    const { pauseWindowDuration, bufferPeriodDuration } = await this.factoryContract.getPauseConfiguration();

    const contractReceipt = await handleContractTx(
      this.factoryContract.create,
      [
        poolConfig.name, // string memory name,
        poolConfig.symbol, // string memory symbol,
        tokens, // IERC20[] memory tokens,
        weights, // uint256[] memory weights
        poolConfig.swapFeePercent, // uint256 swapFeePercentage,
        poolConfig.owner, // address owner
      ],
      { network: poolConfig.network }
    );

    const encodedArgs = await this.getPoolCreationArguments(poolConfig, pauseWindowDuration, bufferPeriodDuration);

    /**
     * Provided encoded constructor arguments for deployed pool verification
     * https://dev.balancer.fi/resources/deploy-pools-from-factory/verification
     */
    return { contractReceipt, encodedArgs };
  }

  async getPoolCreationArguments(
    poolConfig: WeightedPoolConfig,
    pauseWindowDuration: BigNumberish,
    bufferPeriodDuration: BigNumberish
  ): Promise<string> {
    const { tokens, weights } = this.getTokensFromConfig(poolConfig);

    const vaultAddress = await this.factoryContract.getVault();
    const encodedArgs = utils.defaultAbiCoder.encode(
      ['address', 'string', 'string', 'address[]', 'uint256[]', 'uint256', 'uint256', 'uint256', 'address'],
      [
        vaultAddress, // getVault(),
        poolConfig.name, // name,
        poolConfig.symbol, // symbol,
        tokens, // tokens,
        weights, // weights,
        poolConfig.swapFeePercent, // swapFeePercentage,
        pauseWindowDuration, // pauseWindowDuration,
        bufferPeriodDuration, // bufferPeriodDuration,
        poolConfig.owner, // owner
      ]
    );
    // NOTE: '0x' is commonly dropped when verifying source code
    // const formatedArgs = encodedArgs.slice(2);
    return encodedArgs;
  }
}

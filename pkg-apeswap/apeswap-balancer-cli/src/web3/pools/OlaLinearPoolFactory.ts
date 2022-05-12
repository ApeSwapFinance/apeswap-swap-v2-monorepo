import { constants, providers, Wallet, utils, BigNumberish } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import OlaLinearPoolABI from '@ape.swap/v2-deployments/tasks/20220427-ola-linear-pool/abi/OlaLinearPool.json';
import OlaLinearPoolFactoryABI from '@ape.swap/v2-deployments/tasks/20220427-ola-linear-pool/abi/OlaLinearPoolFactory.json';
import { OlaLinearPool } from '@balancer-labs/typechain/dist/OlaLinearPool';
import { OlaLinearPoolFactory as OlaLinearPoolFactoryContract } from '@balancer-labs/typechain/dist/OlaLinearPoolFactory';
import { BatchSwap, SwapKind } from '@balancer-labs/balancer-js';
import { OlaLinearPoolConfig } from './configs';
import { getContractConfig, NETWORK_TYPE } from '../config';
import { handleContractTx } from '../txManager';

// TODO: Pool class?
// function getOlaLinearPoolContract(
//   address = constants.AddressZero,
//   signerOrProvider: Wallet | providers.BaseProvider
// ): OlaLinearPool {
//   return (new Contract(address, OlaLinearPoolABI, signerOrProvider) as unknown) as OlaLinearPool;
// }

interface ContractConfig {
  network?: NETWORK_TYPE;
  address?: string;
}

export default class OlaLinearPoolFactory {
  factoryContract: OlaLinearPoolFactoryContract;
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
      OlaLinearPoolFactoryABI,
      signerOrProvider
    ) as unknown) as OlaLinearPoolFactoryContract;
    this.network = network;
  }

  canSignTxs(): void {
    if (!this.canSign) {
      throw new Error(`Vault:: Signer not provided when creating contract which only allows for read calls.`);
    }
  }

  getOlaLinearPoolFactoryContract(): OlaLinearPoolFactoryContract {
    return this.factoryContract;
  }

  private getTokensFromConfig(olaLinearPoolConfig: OlaLinearPoolConfig): { mainToken: string; wrappedToken: string } {
    let mainToken, wrappedToken;
    const tokens = Object.keys(olaLinearPoolConfig.tokens);
    // Verify token length
    if (tokens.length != 2) {
      throw new Error(`createOlaLinearPool:: OlaLinearPool requires exactly two tokens.`);
    }
    // Find wrappedToken and mainToken
    if (olaLinearPoolConfig.tokens[tokens[0]].isWrappedToken && !olaLinearPoolConfig.tokens[tokens[1]].isWrappedToken) {
      wrappedToken = tokens[0];
      mainToken = tokens[1];
    } else if (
      !olaLinearPoolConfig.tokens[tokens[0]].isWrappedToken &&
      olaLinearPoolConfig.tokens[tokens[1]].isWrappedToken
    ) {
      wrappedToken = tokens[1];
      mainToken = tokens[0];
    } else {
      throw new Error(`createOlaLinearPool:: wrapped and main tokens are not found.`);
    }

    return { mainToken, wrappedToken };
  }

  /**
   * Create a OlaLinearPool from the Pool Factory
   *
   * Returns encoded constructor arguments to verify contracts.
   *
   * @param {OlaLinearPoolConfig} olaLinearPoolConfig
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async createPool(olaLinearPoolConfig: OlaLinearPoolConfig) {
    const { mainToken, wrappedToken } = this.getTokensFromConfig(olaLinearPoolConfig);

    const { pauseWindowDuration, bufferPeriodDuration } = await this.factoryContract.getPauseConfiguration();

    const contractReceipt = await handleContractTx(
      this.factoryContract.create(
        olaLinearPoolConfig.name,
        olaLinearPoolConfig.symbol,
        mainToken,
        wrappedToken,
        olaLinearPoolConfig.upperTarget,
        olaLinearPoolConfig.swapFeePercent,
        olaLinearPoolConfig.owner
      )
    );

    const encodedArgs = await this.getPoolCreationArguments(
      olaLinearPoolConfig,
      pauseWindowDuration,
      bufferPeriodDuration
    );

    /**
     * Provided encoded constructor arguments for deployed pool verification
     * https://dev.balancer.fi/resources/deploy-pools-from-factory/verification
     */
    // TODO: Pull out contract address from events and then poolId from the pool/event
    return { contractReceipt, encodedArgs };
  }

  async getPoolCreationArguments(
    olaLinearPoolConfig: OlaLinearPoolConfig,
    pauseWindowDuration: BigNumberish,
    bufferPeriodDuration: BigNumberish
  ): Promise<string> {
    const { mainToken, wrappedToken } = this.getTokensFromConfig(olaLinearPoolConfig);

    const vaultAddress = await this.factoryContract.getVault();
    const encodedArgs = utils.defaultAbiCoder.encode(
      ['address', 'string', 'string', 'address', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'address'],
      [
        vaultAddress, // getVault(),
        olaLinearPoolConfig.name, // name,
        olaLinearPoolConfig.symbol, // symbol,
        mainToken, // mainToken,
        wrappedToken, // wrappedToken,
        olaLinearPoolConfig.upperTarget, // upperTarget,
        olaLinearPoolConfig.swapFeePercent, // swapFeePercentage,
        // NOTE: pauseWindowDuration is constantly falling and needs to be properly set from deployment time
        pauseWindowDuration, // pauseWindowDuration,
        bufferPeriodDuration, // bufferPeriodDuration,
        olaLinearPoolConfig.owner, // owner
      ]
    );
    return encodedArgs;
  }

  async getCreationCode(): Promise<string> {
    return await this.factoryContract.getCreationCode();
  }
}

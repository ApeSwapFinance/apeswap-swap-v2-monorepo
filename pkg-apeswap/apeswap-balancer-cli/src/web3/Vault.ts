import VaultABI from '@ape.swap/v2-deployments/tasks/20210418-vault/abi/Vault.json';
import { BatchSwap } from '@balancer-labs/balancer-js';
import { Vault as VaultType } from '@balancer-labs/typechain/dist/Vault';
import { Contract, constants, Wallet, BigNumber, providers } from 'ethers';
import { NETWORK_TYPE } from './config';
import { getTxOverrides } from './provider';
import { handleContractTx } from './txManager';

interface VaultConfig {
  network?: NETWORK_TYPE;
  address?: string;
}

export default class Vault {
  vaultContract: VaultType;
  network: NETWORK_TYPE;
  canSign = false;

  constructor(
    signerOrProvider: Wallet | providers.JsonRpcProvider,
    { network = 'bsc', address = constants.AddressZero }: VaultConfig
  ) {
    if (signerOrProvider instanceof Wallet) {
      this.canSign = true;
    }
    this.vaultContract = (new Contract(address, VaultABI, signerOrProvider) as unknown) as VaultType;
    this.network = network;
  }

  canSignTxs(): void {
    if (!this.canSign) {
      throw new Error(`Vault:: Signer not provided when creating contract which only allows for read calls.`);
    }
  }

  //   TODO: Test
  async sendBatchSwap(batchSwap: BatchSwap): Promise<void> {
    this.canSignTxs();
    await handleContractTx(
      this.vaultContract.batchSwap.arguments(
        batchSwap.kind,
        batchSwap.swaps,
        batchSwap.assets,
        batchSwap.funds,
        batchSwap.limits,
        batchSwap.deadline,
        getTxOverrides(this.network, {})
      )
    );
  }

  async queryBatchSwap(batchSwap: BatchSwap): Promise<BigNumber[]> {
    const queryReturn = await this.vaultContract.callStatic.queryBatchSwap(
      batchSwap.kind,
      batchSwap.swaps,
      batchSwap.assets,
      batchSwap.funds
    );

    return queryReturn;
  }
}

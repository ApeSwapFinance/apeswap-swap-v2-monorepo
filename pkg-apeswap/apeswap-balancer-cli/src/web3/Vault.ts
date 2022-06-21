import VaultABI from '@ape.swap/v2-deployments/tasks/20210418-vault/abi/Vault.json';
import { Vault as VaultType } from '@balancer-labs/typechain/dist/Vault';
import BalancerHelpersABI from '@ape.swap/v2-deployments/tasks/20210418-vault/abi/BalancerHelpers.json';
import { BalancerHelpers } from '@balancer-labs/typechain/dist/BalancerHelpers';
import { BatchSwap, ExitPoolRequest, JoinPoolRequest } from '@balancer-labs/balancer-js';
import { Contract, BigNumber, ContractReceipt } from 'ethers';
import { getContractConfig, NETWORK_TYPE } from './config';
import { getProvider, getWallet } from './provider';
import { handleContractTx } from './txManager';

// eslint-disable-next-line
export async function queryJoin(
  network: NETWORK_TYPE,
  poolId: string,
  sender: string,
  recipient: string,
  joinPoolRequest: JoinPoolRequest
) {
  const provider = getProvider(network);
  const { balancerHelpersAddress } = getContractConfig(network);
  const balancerHelpersContract = (new Contract(
    balancerHelpersAddress,
    BalancerHelpersABI,
    provider
  ) as unknown) as BalancerHelpers;
  const queryReturn = await balancerHelpersContract.callStatic.queryJoin(poolId, sender, recipient, joinPoolRequest);
  return queryReturn;
}

// eslint-disable-next-line
export async function queryExit(
  network: NETWORK_TYPE,
  poolId: string,
  sender: string,
  recipient: string,
  exitPoolRequest: ExitPoolRequest
) {
  const provider = getProvider(network);
  const { balancerHelpersAddress } = getContractConfig(network);
  const balancerHelpersContract = (new Contract(
    balancerHelpersAddress,
    BalancerHelpersABI,
    provider
  ) as unknown) as BalancerHelpers;
  const queryReturn = await balancerHelpersContract.callStatic.queryExit(poolId, sender, recipient, exitPoolRequest);
  return queryReturn;
}

export async function queryBatchSwap(network: NETWORK_TYPE, batchSwap: BatchSwap): Promise<BigNumber[]> {
  const provider = getProvider(network);
  const { vaultAddress } = getContractConfig(network);
  const vaultContract = (new Contract(vaultAddress, VaultABI, provider) as unknown) as VaultType;
  const queryReturn = await vaultContract.callStatic.queryBatchSwap(
    batchSwap.kind,
    batchSwap.swaps,
    batchSwap.assets,
    batchSwap.funds
  );

  return queryReturn;
}

export async function sendBatchSwap(network: NETWORK_TYPE, batchSwap: BatchSwap): Promise<ContractReceipt> {
  const wallet = getWallet(network);
  const { vaultAddress } = getContractConfig(network);
  const vaultContract = (new Contract(vaultAddress, VaultABI, wallet) as unknown) as VaultType;

  const contractReceipt = await handleContractTx(
    vaultContract.batchSwap,
    [batchSwap.kind, batchSwap.swaps, batchSwap.assets, batchSwap.funds, batchSwap.limits, batchSwap.deadline],
    { network }
  );

  return contractReceipt;
}

export async function sendJoinPool(
  network: NETWORK_TYPE,
  poolId: string,
  joinPoolRequest: JoinPoolRequest
): Promise<ContractReceipt> {
  const wallet = getWallet(network);
  const accountAddress = wallet.address;

  const { vaultAddress } = getContractConfig(network);
  const vaultContract = (new Contract(vaultAddress, VaultABI, wallet) as unknown) as VaultType;

  const contractReceipt = await handleContractTx(
    vaultContract.joinPool,
    [poolId, accountAddress, accountAddress, joinPoolRequest],
    {
      network,
    }
  );

  return contractReceipt;
}

export async function sendExitPool(
  network: NETWORK_TYPE,
  poolId: string,
  exitPoolRequest: ExitPoolRequest
): Promise<ContractReceipt> {
  const wallet = getWallet(network);
  const accountAddress = wallet.address;

  const { vaultAddress } = getContractConfig(network);
  const vaultContract = (new Contract(vaultAddress, VaultABI, wallet) as unknown) as VaultType;

  const contractReceipt = await handleContractTx(
    vaultContract.exitPool,
    [poolId, accountAddress, accountAddress, exitPoolRequest],
    {
      network,
    }
  );

  return contractReceipt;
}

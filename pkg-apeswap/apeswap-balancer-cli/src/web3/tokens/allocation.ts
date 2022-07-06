import { BigNumber, constants } from 'ethers';
import { Contract } from 'ethers';
import ERC20Build from '../ABI/ERC20.json';
import { ERC20 } from '../ABI/types/ERC20';
import { getContractConfig } from '../config';
import { BasePoolConfig } from '../pools/configs';
import { getWallet } from '../provider';
import { handleContractTx } from '../txManager';

export async function hasSufficientERC20Balance(poolConfig: BasePoolConfig): Promise<void> {
  const provider = getWallet(poolConfig.network);
  const accountAddress = await provider.getAddress();

  for (const token in poolConfig.tokens) {
    const tokenConfig = poolConfig.tokens[token];
    const ERC20Contract = (new Contract(token, ERC20Build.abi, provider) as unknown) as ERC20;
    const balance = await ERC20Contract.balanceOf(accountAddress);
    if (!balance.gte(BigNumber.from(tokenConfig.initialBalance))) {
      throw new Error(
        `deployPool:: Account ${accountAddress} does not have initialBalance of ${tokenConfig.initialBalance} for token contract ${token}.`
      );
    }
  }
}

export async function approveERC20Transfers(poolConfig: BasePoolConfig): Promise<void> {
  const { vaultAddress } = getContractConfig(poolConfig.network);
  const wallet = getWallet(poolConfig.network);
  const accountAddress = wallet.address;

  for (const token in poolConfig.tokens) {
    const tokenConfig = poolConfig.tokens[token];
    const idealAllowance = tokenConfig.allowance == -1 ? constants.MaxUint256 : BigNumber.from(tokenConfig.allowance);
    const ERC20Contract = (new Contract(token, ERC20Build.abi, wallet) as unknown) as ERC20;
    const currentAllowance = await ERC20Contract.allowance(accountAddress, vaultAddress);
    if (currentAllowance.lt(idealAllowance)) {
      const amountToApprove = idealAllowance.sub(currentAllowance);
      console.log(
        `Approving allowance for vault ${vaultAddress} for token ${token} amount ${amountToApprove.toString()}`
      );
      await handleContractTx(ERC20Contract.approve, [vaultAddress, idealAllowance.sub(currentAllowance)], {
        network: poolConfig.network,
      });
    }
  }
}

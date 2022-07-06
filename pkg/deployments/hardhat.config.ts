import 'dotenv/config';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-local-networks-config-plugin';
import { HardhatUserConfig } from 'hardhat/config';

import '@balancer-labs/v2-common/setupTests';

import { task, types } from 'hardhat/config';
import { TASK_TEST } from 'hardhat/builtin-tasks/task-names';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import test from './src/test';
import Task from './src/task';
import Verifier from './src/verifier';
import { Logger } from './src/logger';

task('deploy', 'Run deployment task')
  .addParam('id', 'Deployment task ID')
  .addFlag('force', 'Ignore previous deployments')
  .addOptionalParam('key', 'Etherscan API key to verify contracts')
  .setAction(
    async (args: { id: string; force?: boolean; key?: string; verbose?: boolean }, hre: HardhatRuntimeEnvironment) => {
      Logger.setDefaults(false, args.verbose || false);
      const verifier = args.key ? new Verifier(hre.network, args.key) : undefined;
      await Task.fromHRE(args.id, hre, verifier).run(args);
    }
  );

task('verify-contract', 'Run verification for a given contract')
  .addParam('id', 'Deployment task ID')
  .addParam('name', 'Contract name')
  .addParam('address', 'Contract address')
  .addParam('args', 'ABI-encoded constructor arguments')
  .addParam('key', 'Etherscan API key to verify contracts')
  .setAction(
    async (
      args: { id: string; name: string; address: string; key: string; args: string; verbose?: boolean },
      hre: HardhatRuntimeEnvironment
    ) => {
      Logger.setDefaults(false, args.verbose || false);
      const verifier = args.key ? new Verifier(hre.network, args.key) : undefined;

      await Task.fromHRE(args.id, hre, verifier).verify(args.name, args.address, args.args);
    }
  );

task(TASK_TEST)
  .addOptionalParam('fork', 'Optional network name to be forked block number to fork in case of running fork tests.')
  .addOptionalParam('blockNumber', 'Optional block number to fork in case of running fork tests.', undefined, types.int)
  .setAction(test);

const config: HardhatUserConfig = {
  networks: {
    dev: {
      url: 'http://127.0.0.1:8545',
    },
    bsc: {
      url: 'https://bscrpc.com',
      // NOTE: Use for private key deployments (vanity)
      // accounts: [''],
      // NOTE: Use for mnemonic seed phrase deployments
      accounts: {
        mnemonic: process.env.MAINNET_MNEMONIC,
      },
    },
    'bsc-dummy': {
      url: 'https://bscrpc.com',
      accounts: {
        mnemonic: process.env.MAINNET_MNEMONIC,
      },
    },
    'bsc-testnet': {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      accounts: {
        mnemonic: process.env.TESTNET_MNEMONIC,
      },
    },
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;

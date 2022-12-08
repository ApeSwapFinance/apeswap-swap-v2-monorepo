# <img src="logo.svg" alt="ApeSwap" height="160px"> <img src="logo-b.svg" alt="Balancer" height="64px"> 



# ApeSwap Swap V2 Monorepo
[![Docs](https://img.shields.io/badge/docs-%F0%9F%93%84-yellow)](https://apeswap.gitbook.io/apeswap-finance/welcome/master)
[![CI Status](https://github.com/ApeSwapFinance/apeswap-swap-v2-monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/ApeSwapFinance/apeswap-swap-v2-monorepo/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-GPLv3-green.svg)](https://www.gnu.org/licenses/gpl-3.0)

This repository contains the code for the ApeSwap DEX V2. This project is a fork of [balancer-v2-monorepo](https://github.com/balancer-labs/balancer-v2-monorepo). For more further information please see their detailed [documentation](https://docs.balancer.fi/) as we build out ours.

## Pulling Upstream Changes
Balancer V2 Monorepo is an actively maintained repository. The unaltered Balancer V2 code lives in the [balancer-v2](https://github.com/ApeSwapFinance/apeswap-swap-v2-monorepo/tree/balancer-v2) branch. To pull in new updates to that branch run the following: 

```bash
git checkout balancer-v2
git fetch upstream
git merge upstream/master
```

Now the new updates will be in the [balancer-v2](https://github.com/ApeSwapFinance/apeswap-swap-v2-monorepo/tree/balancer-v2) branch. These updates can then be merged into a feature branch off of `main` reconcile the updates.  

```
git checkout main
git checkout -b feature/<feature-name>
git merge balancer-v2
```

## Balancer Info
This repository contains the Balancer Protocol V2 core smart contracts, including the `Vault` and standard Pools, along with their tests, configuration, and deployment information.

For a high-level introduction to Balancer V2, see [Introducing Balancer V2: Generalized AMMs](https://medium.com/balancer-protocol/balancer-v2-generalizing-amms-16343c4563ff).

## Structure

This is a Yarn 2 monorepo, with the packages meant to be published in the [`pkg`](./pkg) directory. Newly developed packages may not be published yet.

Active development occurs in this repository, which means some contracts in it might not be production-ready. Proceed with caution.

### Packages
<!-- FIXME: Update info for ApeSwap Deployments -->
<!-- - [`v2-deployments`](./pkg/deployments): addresses and ABIs of all Balancer V2 deployed contracts, for mainnet and various test networks. -->
- [`v2-vault`](./pkg/vault): the [`Vault`](./pkg/vault/contracts/Vault.sol) contract and all core interfaces, including [`IVault`](./pkg/vault/contracts/interfaces/IVault.sol) and the Pool interfaces: [`IBasePool`](./pkg/vault/contracts/interfaces/IBasePool.sol), [`IGeneralPool`](./pkg/vault/contracts/interfaces/IGeneralPool.sol) and [`IMinimalSwapInfoPool`](./pkg/vault/contracts/interfaces/IMinimalSwapInfoPool.sol).
- [`v2-pool-weighted`](./pkg/pool-weighted): the [`WeightedPool`](./pkg/pool-weighted/contracts/WeightedPool.sol) and [`WeightedPool2Tokens`](./pkg/pool-weighted/contracts/WeightedPool2Tokens.sol) contracts, along with their associated factories.
- [`v2-pool-utils`](./pkg/pool-utils): Solidity utilities used to develop Pool contracts.
- [`v2-solidity-utils`](./pkg/solidity-utils): miscellaneous Solidity helpers and utilities used in many different contracts.
- [`v2-standalone-utils`](./pkg/standalone-utils): miscellaneous standalone utility contracts.

## Build and Test

On the project root, run:

```bash
$ yarn # install all dependencies
$ yarn build # compile all contracts
$ yarn test # run all tests
```

This will run all tests in parallel. To run a single workspace's tests, run `yarn test` from within that workspace's directory.

You can see a sample report of a test run [here](./audits/test-report.md).

## Security

Multiple independent reviews and audits were performed by [Certora](https://www.certora.com/), [OpenZeppelin](https://openzeppelin.com/) and [Trail of Bits](https://www.trailofbits.com/). The latest reports from these engagements are located in the [`audits`](./audits) directory.

Bug bounties apply to most of the smart contracts hosted in this repository: head to [Balancer V2 Bug Bounties](https://docs.balancer.fi/core-concepts/security/bug-bounties) to learn more.

All core smart contracts are immutable, and cannot be upgraded. See page 6 of the [Trail of Bits audit](https://github.com/balancer-labs/balancer-v2-monorepo/blob/master/audits/trail-of-bits/2021-04-05.pdf):

> Upgradeability | Not Applicable. The system cannot be upgraded.

## Licensing

Most of the Solidity source code is licensed under the GNU General Public License Version 3 (GPL v3): see [`LICENSE`](./LICENSE).

### Exceptions

- All files in the `openzeppelin` directory of the [`v2-solidity-utils`](./pkg/solidity-utils) package are based on the [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) library, and as such are licensed under the MIT License: see [LICENSE](./pkg/solidity-utils/contracts/openzeppelin/LICENSE).
- The `LogExpMath` contract from the [`v2-solidity-utils`](./pkg/solidity-utils) package is licensed under the MIT License.
- All other files, including tests and the [`pvt`](./pvt) directory are unlicensed.

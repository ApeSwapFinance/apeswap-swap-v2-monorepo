# <img src="../../logo.svg" alt="ApeSwap" height="128px">


# ApeSwap Balancer CLI

ApeSwap Balancer CLI is a JavaScript Application which provides commonly used utilities for interacting with Balancer Protocol V2.

## Overview

### Installation

```console
$ npm install @ape.swap/balancer-cli
```

### Usage
Once the Balancer `Vault` and `PoolFactories` have been deployed this tool can be used to create and fund new pools.

#### Deploy A Pool
1. Create a config file in the [Pool Configs](./src/web3/pools/configs/) directory named after [PoolType](./src/web3/pools/configs/index.ts) provided in the configuration.
2. [Update the deployPool Task](./src/tasks/deployPool) with the proper `PoolType`.
3. run `npx ts-node ./src/tasks/deployPool.ts`

#### Join a Pool
1. Add the `poolId` from the pool deployment to the proper pool config in [Pool Configs](./src/web3/pools/configs/).
2. [Update the joinPool Task](./src/tasks/joinPool) with the proper `PoolType`.
3. run `npx ts-node ./src/tasks/joinPool.ts`



## Licensing

[GNU General Public License Version 3 (GPL v3)](../../LICENSE).

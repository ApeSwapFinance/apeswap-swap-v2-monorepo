import Task from '../../src/task';
import { Network } from '../../src/types';

export type BatchRelayerDeployment = {
  Vault: Task;
  wstETH: string;
};

const Vault = new Task('20210418-vault');

const batchRelayerNetworkDeployment: Partial<Record<Network, BatchRelayerDeployment>> = {
  // wstETH is only deployed on mainnet and kovan
  mainnet: {
    Vault,
    wstETH: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
  },
  kovan: {
    Vault,
    wstETH: '0xa387b91e393cfb9356a460370842bc8dbb2f29af',
  },
  rinkeby: {
    Vault,
    wstETH: '0x0000000000000000000000000000000000000000',
  },
  polygon: {
    Vault,
    wstETH: '0x0000000000000000000000000000000000000000',
  },
  arbitrum: {
    Vault,
    wstETH: '0x0000000000000000000000000000000000000000',
  },
};

export default batchRelayerNetworkDeployment;

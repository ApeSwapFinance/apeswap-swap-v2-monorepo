import { ContractReceipt, ContractTransaction, Event } from 'ethers';

export async function handleContractTx(tx: Promise<ContractTransaction>): Promise<ContractReceipt> {
  // ContractReceipt extends TransactionReceipt
  try {
    const contractTx = await tx;
    const txReceipt: ContractReceipt = await contractTx.wait();
    // TODO: Can add cumulative gas here;
    // let totalGas = totalGas.add(txReceipt.gasUsed);
    // let txCost = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);

    return txReceipt;
  } catch (e) {
    console.dir(e, { depth: null });
    console.dir({ failedTx: tx });
    throw new Error(`txManager:: Error sending contract transaction.`);
  }
}

// TODO: Can extend this to pick out specific events
export function getContractReceiptEvents(contractReceipt: ContractReceipt): Array<Event> {
  const parsedEvents = [];
  for (const event of contractReceipt.events || []) {
    parsedEvents.push({ ...event });
  }
  return parsedEvents;
}

import { ContractReceipt, ContractTransaction, Event, Overrides } from 'ethers';
import { NETWORK_TYPE } from './config';
import { getTxOverrides } from './provider';

interface ContractTxOptions {
  network: NETWORK_TYPE;
  overrides?: Overrides;
}

export async function handleContractTx<F extends (...args: Parameters<F>) => Promise<ContractTransaction>>(
  tx: F,
  args: Parameters<F>,
  txOptions: ContractTxOptions
): Promise<ContractReceipt> {
  console.log(`txManager:: Sending tx...`);
  const numArgs = (args as Array<any>).length;
  const computedArgs = args;
  if (numArgs) {
    const finalIndex = numArgs - 1;
    const finalArg: Overrides = (args as Array<any>)[finalIndex];
    // Final argument passed can be overrides so determining if they were passed here
    if (
      finalArg.gasLimit ||
      finalArg.gasPrice ||
      finalArg.maxFeePerGas ||
      finalArg.maxPriorityFeePerGas ||
      finalArg.nonce ||
      finalArg.type ||
      finalArg.accessList
    ) {
      // Final arg IS override
      (computedArgs as Array<any>)[finalIndex] = getTxOverrides(txOptions.network, {
        ...finalArg,
        ...(txOptions.overrides || {}),
      });
    } else {
      // Final arg IS NOT override
      (computedArgs as Array<any>).push(getTxOverrides(txOptions.network, txOptions.overrides || {}));
    }
  } else {
    // No args passed
    ((computedArgs as unknown) as [Overrides]) = [getTxOverrides(txOptions.network, txOptions.overrides || {})];
  }
  // Send tx with computed overrides
  const contractTx = await tx(...computedArgs);

  console.log(`txManager:: Waiting for contract receipt.`);
  const txReceipt: ContractReceipt = await contractTx.wait();
  console.log(`txManager:: TX confirmed!`);
  return txReceipt;
}

export async function pollContractRead<R, F extends (...args: Parameters<F>) => Promise<R>>(
  readTx: F,
  args: Parameters<F>
): Promise<R> {
  return await _pollContractRead(readTx, args, 0);
}

function delaySeconds(seconds: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, seconds * 1000);
  });
}

// eslint-disable-next-line
// @ts-ignore
async function _pollContractRead<R, F extends (...args: Parameters<F>) => Promise<R>>(
  readTx: F,
  args: Parameters<F>,
  retryNumber = 0
): Promise<R> {
  const MAX_RETRYS = 10; // NOTE: Can bubble this up to config file
  try {
    return await readTx(...args);
  } catch (e) {
    if (retryNumber < MAX_RETRYS) {
      console.error(
        `${_pollContractRead.name}:: Error reading contract. Trying ${MAX_RETRYS - retryNumber} more time(s).`
      );
      delaySeconds(5);
      _pollContractRead(readTx, args, retryNumber + 1);
    }
    console.dir(e);
    throw new Error(`${_pollContractRead.name}:: Error reading contract. MAX_RETRYS reached!`);
  }
}

export function getContractReceiptEvents(contractReceipt: ContractReceipt, eventOrTopic: string): Array<Event> {
  const parsedEvents = [];
  for (const txEvent of contractReceipt.events || []) {
    // Parse topics
    if (txEvent.event === eventOrTopic || txEvent.topics.includes(eventOrTopic)) {
      parsedEvents.push(txEvent);
    }
  }
  return parsedEvents;
}

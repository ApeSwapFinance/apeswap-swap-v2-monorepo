/**
 * Balancer Pools must be created with addresses sorted numerically.
 * https://dev.balancer.fi/resources/deploy-pools-from-factory/creation#defining-addresses
 * @param addresses
 */
export function sortAddresses(addresses: string[]): string[] {
  // Create a copy with spread to remove pointer
  return [...addresses].sort((addA, addB) => {
    // Sort ascending
    return parseInt(addA, 16) - parseInt(addB, 16);
  });
}

export function sortAddressObject<T>(addressObject: { [key: string]: T }): { [key: string]: T } {
  const sortedObject = sortAddresses(Object.keys(addressObject)).reduce((obj, key) => {
    obj[key] = addressObject[key];
    return obj;
  }, {} as { [key: string]: T });

  return sortedObject;
}

const equals = (a: string[], b: string[]) => JSON.stringify(a) === JSON.stringify(b);

export function addressesAreSorted(addresses: string[]): boolean {
  const sortedAddresses = sortAddresses(addresses);
  return equals(sortedAddresses, addresses);
}

export * from './addresses';

export function logHeader(message: string): void {
  const breakPoint = '==============================================================';
  const breakPointLength = breakPoint.length;
  const messageLength = message.length;
  const paddingLength = Math.floor((breakPointLength - messageLength) / 2);
  const displayMessage = `${Array(paddingLength).join('=')} ${message} ${Array(paddingLength).join('=')}`;
  console.log(`
      ${breakPoint}
      ${displayMessage}
      ${breakPoint}
    `);
}

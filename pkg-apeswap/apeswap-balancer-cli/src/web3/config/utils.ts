export function getEnv(key: string, require = false): string {
  const value = process.env[key];
  if (require && !value) {
    throw new Error(`ENV variable ${key} not found, but required.`);
  }
  return value || '';
}

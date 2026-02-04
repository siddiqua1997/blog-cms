export function getEnv(name: string): string | undefined {
  return process.env[name];
}

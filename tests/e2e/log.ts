/**
 * Opt-in e2e info logs. Default runs stay on pass/fail output.
 * Enable with `--verbose` on the parallel runner, or `E2E_VERBOSE=1`.
 */
export function isE2eVerbose(): boolean {
  const value = process.env.E2E_VERBOSE;

  return value === '1' || value === 'true';
}

export function e2eLog(...args: unknown[]): void {
  if (isE2eVerbose()) {
    console.log(...args);
  }
}

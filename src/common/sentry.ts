/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022 Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

const DEFAULT_TRACES_SAMPLE_RATE = 0.1;

interface SentryRuntimeConfig {
  dsn?: string;
  hosted: boolean;
  production: boolean;
}

export function shouldInitializeSentry({
  dsn,
  hosted,
  production,
}: SentryRuntimeConfig): boolean {
  return production && hosted && Boolean(dsn?.trim());
}

export function parseSentryTracesSampleRate(value?: string): number {
  if (!value?.trim()) {
    return DEFAULT_TRACES_SAMPLE_RATE;
  }

  const sampleRate = Number(value);

  return Number.isFinite(sampleRate) && sampleRate >= 0 && sampleRate <= 1
    ? sampleRate
    : DEFAULT_TRACES_SAMPLE_RATE;
}

function originPattern(value: string): RegExp | undefined {
  try {
    const origin = new URL(value).origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return new RegExp(`^${origin}(?:/|$)`);
  } catch {
    return undefined;
  }
}

function tracePropagationTargets(): RegExp[] {
  const configuredTargets =
    import.meta.env.VITE_SENTRY_TRACE_PROPAGATION_TARGETS?.split(',')
      .map((target) => target.trim())
      .filter(Boolean);

  const targets = configuredTargets?.length
    ? configuredTargets
    : [import.meta.env.VITE_HOSTED_API_URL || 'https://invoicing.co'];

  return targets
    .map(originPattern)
    .filter((target): target is RegExp => Boolean(target));
}

export async function initializeSentry(): Promise<boolean> {
  const dsn = import.meta.env.VITE_SENTRY_URL?.trim();

  if (
    !import.meta.env.PROD ||
    import.meta.env.VITE_IS_HOSTED !== 'true' ||
    !dsn
  ) {
    return false;
  }

  const Sentry = await import('@sentry/react');

  Sentry.init({
    dsn,
    environment:
      import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    sendDefaultPii: false,
    tracePropagationTargets: tracePropagationTargets(),
    tracesSampleRate: parseSentryTracesSampleRate(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE
    ),
  });

  return true;
}

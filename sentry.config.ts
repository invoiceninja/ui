import type { SentryVitePluginOptions } from '@sentry/vite-plugin';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import type { Plugin } from 'vite';

const SENTRY_SOURCE_MAP_BUILD_KEYS = [
  'SENTRY_AUTH_TOKEN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  'SENTRY_URL',
];
const SENTRY_RELEASE_ENVIRONMENT_KEYS =
  'VITE_SENTRY_RELEASE, CF_PAGES_COMMIT_SHA, or GITHUB_SHA';

type Environment = Record<string, string | undefined>;

export interface SentryConfig {
  define: Record<string, string>;
  plugin: Plugin[] | null;
  sourcemap: 'hidden' | false;
}

function validateSentryConfiguration(
  command: string,
  environment: Environment
) {
  if (command !== 'build' || environment.VITE_IS_HOSTED !== 'true') {
    return;
  }

  const dsn = environment.VITE_SENTRY_URL?.trim();

  if (!dsn) {
    throw new Error('VITE_SENTRY_URL is required for hosted builds.');
  }

  try {
    const url = new URL(dsn);

    if (!['http:', 'https:'].includes(url.protocol) || !url.username) {
      throw new Error();
    }
  } catch {
    throw new Error('VITE_SENTRY_URL must be a valid Sentry DSN.');
  }

  const configuredSampleRate = environment.VITE_SENTRY_TRACES_SAMPLE_RATE;

  if (configuredSampleRate) {
    const sampleRate = Number(configuredSampleRate);

    if (!Number.isFinite(sampleRate) || sampleRate < 0 || sampleRate > 1) {
      throw new Error(
        'VITE_SENTRY_TRACES_SAMPLE_RATE must be a number between 0 and 1.'
      );
    }
  }
}

function resolveSentryRelease(environment: Environment): string | undefined {
  return (
    environment.VITE_SENTRY_RELEASE?.trim() ||
    environment.CF_PAGES_COMMIT_SHA?.trim() ||
    environment.GITHUB_SHA?.trim()
  );
}

function sentrySourceMapOptions(
  environment: Environment,
  release: string | undefined
): SentryVitePluginOptions {
  const missingKeys = SENTRY_SOURCE_MAP_BUILD_KEYS.filter(
    (key) => !environment[key]?.trim()
  );

  if (missingKeys.length > 0) {
    throw new Error(
      `Incomplete Sentry source map configuration. Missing: ${missingKeys.join(', ')}.`
    );
  }

  if (!release) {
    throw new Error(
      `Incomplete Sentry source map configuration. Missing: ${SENTRY_RELEASE_ENVIRONMENT_KEYS}.`
    );
  }

  return {
    authToken: environment.SENTRY_AUTH_TOKEN,
    errorHandler(error) {
      console.warn(
        'Sentry source-map upload failed; continuing the build.',
        error
      );
    },
    org: environment.SENTRY_ORG,
    project: environment.SENTRY_PROJECT,
    release: {
      name: release,
    },
    sourcemaps: {
      filesToDeleteAfterUpload: ['./dist/**/*.map'],
    },
    telemetry: false,
    url: environment.SENTRY_URL,
  };
}

export function createSentryConfig(
  command: string,
  environment: Environment
): SentryConfig {
  validateSentryConfiguration(command, environment);
  const release = resolveSentryRelease(environment);

  const plugin =
    command === 'build' && environment.VITE_IS_HOSTED === 'true'
      ? sentryVitePlugin(sentrySourceMapOptions(environment, release))
      : null;

  return {
    define: {
      'import.meta.env.VITE_SENTRY_RELEASE': JSON.stringify(release || ''),
    },
    plugin,
    sourcemap: plugin ? 'hidden' : false,
  };
}

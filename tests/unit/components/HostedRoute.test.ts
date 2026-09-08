import type { ReactElement } from 'react';
import { Navigate, Outlet } from 'react-router';
import { afterEach, describe, expect, test, vi } from 'vitest';

const hostedState = vi.hoisted(() => ({ hosted: true }));

vi.mock('../../../src/common/helpers', () => ({
  isHosted: () => hostedState.hosted,
}));

import { HostedRoute } from '../../../src/components/HostedRoute';

describe('HostedRoute', () => {
  afterEach(() => {
    hostedState.hosted = true;
  });

  test('renders the child outlet on hosted', () => {
    hostedState.hosted = true;

    const element = HostedRoute() as ReactElement;

    expect(element.type).toBe(Outlet);
  });

  test('redirects away on self-hosted', () => {
    hostedState.hosted = false;

    const element = HostedRoute() as ReactElement<{ to: string }>;

    expect(element.type).toBe(Navigate);
    expect(element.props.to).toBe('/');
  });

  test('renders the child outlet when explicitly enabled', () => {
    hostedState.hosted = false;

    const element = HostedRoute({ enabled: true }) as ReactElement;

    expect(element.type).toBe(Outlet);
  });
});

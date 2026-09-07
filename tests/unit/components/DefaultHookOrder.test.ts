import { createElement, useState } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const unlockState = vi.hoisted(() => ({
  hostedResult: true,
  hostedHook: vi.fn(),
  selfHostedHook: vi.fn(),
}));

vi.mock('jotai', () => ({
  useAtomValue: () => undefined,
}));

vi.mock('react-feather', () => ({
  Info: () => null,
  Menu: () => null,
}));

vi.mock('react-hot-toast', () => ({
  default: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string) => key],
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('$app/common/colors', () => ({
  useColorScheme: () => ({ $1: '', $3: '', $23: '' }),
}));

vi.mock('$app/common/helpers', () => ({
  isDemo: () => false,
  isHosted: () => true,
  isSelfHosted: () => false,
  trans: () => '',
}));

vi.mock('$app/common/hooks/useCurrentCompanyUser', () => ({
  useCurrentCompanyUser: () => undefined,
}));

vi.mock('$app/common/hooks/useCurrentUser', () => ({
  useCurrentUser: () => undefined,
}));

vi.mock('$app/common/hooks/usePreventNavigation', () => ({
  usePreventNavigation: () => vi.fn(),
}));

vi.mock('$app/common/hooks/useReactSettings', () => ({
  useReactSettings: () => ({}),
}));

// Consume real React hook slots, matching the selector hooks used in production.
vi.mock('$app/common/hooks/useUnlockButtonForHosted', () => ({
  useUnlockButtonForHosted: () => {
    useState(null);
    unlockState.hostedHook();

    return unlockState.hostedResult;
  },
}));

vi.mock('$app/common/hooks/useUnlockButtonForSelfHosted', () => ({
  useUnlockButtonForSelfHosted: () => {
    useState(null);
    unlockState.selfHostedHook();

    return false;
  },
}));

vi.mock('$app/common/queries/sockets', () => ({
  useSocketEvent: () => undefined,
}));

vi.mock('$app/components/Breadcrumbs', () => ({
  Breadcrumbs: () => null,
}));

vi.mock('$app/components/dropdown/Dropdown', () => ({
  Dropdown: () => null,
}));

vi.mock('$app/components/dropdown/DropdownElement', () => ({
  DropdownElement: () => null,
}));

vi.mock('$app/components/forms', () => ({
  Button: () => null,
  Link: () => null,
}));

vi.mock('$app/components/layouts/common/hooks', () => ({
  saveBtnAtom: Symbol('saveBtnAtom'),
  useNavigationTopRightElement: () => undefined,
}));

vi.mock('$app/components/QuickCreatePopover', () => ({
  QuickCreatePopover: () => null,
}));

vi.mock('$app/pages/dashboard/components/Search', () => ({
  Search: () => null,
}));

vi.mock('$app/components/banners/ActivateCompany', () => ({
  ActivateCompany: () => null,
}));

vi.mock('$app/components/banners/EInvoiceCredits', () => ({
  EInvoiceCredits: () => null,
}));

vi.mock('$app/components/banners/PriceIncrease', () => ({
  PriceIncreaseBanner: () => null,
}));

vi.mock('$app/components/banners/VerifyEmail', () => ({
  VerifyEmail: () => null,
}));

vi.mock('$app/components/banners/VerifyPhone', () => ({
  VerifyPhone: () => null,
}));

vi.mock('$app/components/banners/AccountPlanExpired', () => ({
  AccountPlanExpired: () => null,
}));

vi.mock('$app/components/Feedback', () => ({
  Feedback: () => null,
}));

vi.mock('$app/components/Notifications', () => ({
  Notifications: () => null,
}));

vi.mock('$app/components/layouts/common/navigation', () => ({
  useNavigation: () => [],
}));

vi.mock('$app/components/layouts/components/DesktopSidebar', () => ({
  DesktopSidebar: () => null,
}));

vi.mock('$app/components/layouts/components/MobileSidebar', () => ({
  MobileSidebar: () => null,
}));

import { Default } from '../../../src/components/layouts/Default';

describe('Default unlock button hook order', () => {
  beforeEach(() => {
    unlockState.hostedResult = true;
    unlockState.hostedHook.mockClear();
    unlockState.selfHostedHook.mockClear();
  });

  test('keeps both unlock hooks mounted when hosted eligibility changes', () => {
    let renderer: ReactTestRenderer;

    act(() => {
      renderer = create(createElement(Default, { breadcrumbs: [] }));
    });

    expect(unlockState.hostedHook).toHaveBeenCalledTimes(1);

    unlockState.hostedResult = false;

    expect(() => {
      act(() => {
        renderer.update(createElement(Default, { breadcrumbs: [] }));
      });
    }).not.toThrow();

    expect(unlockState.hostedHook).toHaveBeenCalledTimes(2);
    expect(unlockState.selfHostedHook).toHaveBeenCalledTimes(2);

    act(() => renderer.unmount());
  });
});

import { describe, expect, test, vi } from 'vitest';
import type { User } from '../../../../../src/common/interfaces/user';

vi.mock('$app/common/colors', () => ({
  useColorScheme: () => ({}),
}));

vi.mock('$app/common/queries/calendar', () => ({
  isCalendarProvider: (provider: unknown) =>
    provider === 'google' || provider === 'microsoft',
  useCompleteCalendarConnection: () => ({
    mutateAsync: vi.fn(),
  }),
}));

vi.mock('$app/common/hooks/useRefetch', () => ({
  $refetch: vi.fn(),
}));

vi.mock('$app/common/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('$app/common/stores/slices/user', () => ({
  updateUser: vi.fn((user) => user),
}));

vi.mock('$app/components/Spinner', () => ({
  Spinner: () => null,
}));

vi.mock('$app/components/forms', () => ({
  Button: () => null,
}));

import { markCalendarConnected } from '../../../../../src/pages/tasks/calendar/Complete';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'x',
  first_name: 'Jim',
  last_name: 'Bob',
  email: 'g@gmail.com',
  phone: '1234567890',
  has_password: true,
  oauth_provider_id: 'google',
  custom_value1: 'x',
  custom_value2: 'x',
  custom_value3: 'x',
  custom_value4: 'x',
  email_verified_at: 0,
  google_2fa_secret: false,
  is_deleted: false,
  last_confirmed_email_address: '',
  last_login: 0,
  oauth_user_token: '',
  signature: '',
  verified_phone_number: false,
  created_at: 0,
  updated_at: 0,
  archived_at: 0,
  language_id: '1',
  user_logged_in_notification: true,
  ...overrides,
});

describe('markCalendarConnected', () => {
  test('marks a user settings calendar connection as connected', () => {
    const user = makeUser();

    expect(
      markCalendarConnected(user).settings?.calendar_connection?.status
    ).toBe('CONNECTED');
  });

  test('stores the completed calendar email when returned', () => {
    const user = makeUser();

    expect(
      markCalendarConnected(user, 'turbo124@gmail.com').settings
        ?.calendar_connection
    ).toMatchObject({
      status: 'CONNECTED',
      email: 'turbo124@gmail.com',
    });
  });

  test('preserves referral metadata and existing user settings', () => {
    const user = makeUser({
      referral_meta: { pro: 1, free: 0, enterprise: 0 },
      settings: {
        theme: 'dark',
        calendar_connection: { status: 'DISCONNECTED' },
      },
    });

    expect(markCalendarConnected(user)).toMatchObject({
      referral_meta: { pro: 1, free: 0, enterprise: 0 },
      settings: {
        theme: 'dark',
        calendar_connection: { status: 'CONNECTED' },
      },
    });
  });
});

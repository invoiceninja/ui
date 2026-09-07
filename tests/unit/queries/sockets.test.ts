import { describe, expect, test } from 'vitest';
import {
  buildGeneralChannelName,
  buildPrivateChannelNames,
  events,
} from '../../../src/common/queries/sockets';

describe('socket channel names', () => {
  test('buildPrivateChannelNames returns company and user channels when available', () => {
    expect(
      buildPrivateChannelNames({
        companyKey: 'company-key',
        accountKey: 'account-key',
        userId: 'hashed-user-id',
      })
    ).toEqual([
      'private-company-company-key',
      'private-user-account-key-hashed-user-id',
    ]);
  });

  test('buildPrivateChannelNames omits user channel when account or user is missing', () => {
    expect(
      buildPrivateChannelNames({
        companyKey: 'company-key',
        userId: 'hashed-user-id',
      })
    ).toEqual(['private-company-company-key']);

    expect(
      buildPrivateChannelNames({
        accountKey: 'account-key',
        userId: 'hashed-user-id',
      })
    ).toEqual(['private-user-account-key-hashed-user-id']);
  });

  test('buildGeneralChannelName selects hosted or selfhosted channel', () => {
    expect(buildGeneralChannelName(true)).toBe('general_hosted');
    expect(buildGeneralChannelName(false)).toBe('general_selfhosted');
  });

  test('registers RefetchEntity instead of the legacy RefreshEntity name', () => {
    expect(events).toContain('App\\Events\\Socket\\RefetchEntity');
    expect(events).not.toContain('App\\Events\\Socket\\RefreshEntity');
  });
});

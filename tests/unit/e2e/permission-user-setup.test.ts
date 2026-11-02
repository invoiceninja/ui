import { beforeEach, expect, test, vi } from 'vitest';
import {
  ensurePermissionUserExists,
  type ApiContext,
} from '$tests/e2e/api-helpers';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  dispose: vi.fn(),
}));
vi.mock('@playwright/test', () => ({
  request: { newContext: async () => mocks },
}));

const api: ApiContext = {
  baseUrl: 'https://api.example.test',
  token: 'test-token',
  headers: { 'X-Api-Token': 'test-token' },
};

beforeEach(() => vi.resetAllMocks());

test('setup finds an existing permission user beyond the first page instead of creating a duplicate', async () => {
  mocks.get
    .mockResolvedValueOnce({
      ok: () => true,
      json: async () => ({
        data: Array.from({ length: 100 }, (_, id) => ({
          id: String(id),
          email: `other-${id}@example.test`,
        })),
        meta: { pagination: { total_pages: 2 } },
      }),
    })
    .mockResolvedValueOnce({
      ok: () => true,
      json: async () => ({
        data: [
          {
            id: 'existing',
            email: 'permissions1@example.com',
            first_name: 'Permissions',
            last_name: 'Example',
            is_deleted: false,
          },
        ],
        meta: { pagination: { total_pages: 2 } },
      }),
    });

  await expect(
    ensurePermissionUserExists(api, 'permissions1@example.com')
  ).resolves.toBe('existing');
  expect(mocks.get).toHaveBeenNthCalledWith(
    2,
    '/api/v1/users?per_page=100&include_deleted=true&page=2',
    { headers: api.headers }
  );
  expect(mocks.post).not.toHaveBeenCalled();
  expect(mocks.dispose).toHaveBeenCalledOnce();
});

test('a failed user lookup reports the error instead of treating the account as empty', async () => {
  mocks.get.mockResolvedValue({ ok: () => false, status: () => 503 });
  await expect(
    ensurePermissionUserExists(api, 'permissions1@example.com')
  ).rejects.toThrow('Failed to fetch users (503)');
  expect(mocks.post).not.toHaveBeenCalled();
  expect(mocks.dispose).toHaveBeenCalledOnce();
});

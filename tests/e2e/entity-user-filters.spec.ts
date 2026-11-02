import { login } from './helpers';
import { test, expect, resetAccountBeforeAll, uniqueName } from './fixtures';
import {
  ensureColumnFilterUsers,
  formatUserLabel,
  resetUserReactSettings,
  updateUserReactSettings,
} from './api-helpers';
import {
  applyColumnFilter,
  clearColumnFilter,
  expectTableListsOnly,
  waitForEntityListRequest,
} from './entity-user-filter-helpers';

resetAccountBeforeAll();
test.use({ actionTimeout: 10000 });

// Include projects' different assigned_to column key and the existing task filters.
const cases = [
  { type: 'clients', resource: 'client', field: 'name' },
  { type: 'vendors', resource: 'vendor', field: 'name' },
  { type: 'products', resource: 'product', field: 'product_key' },
  { type: 'projects', resource: 'project', field: 'name' },
  { type: 'tasks', resource: 'task', field: 'description' },
] as const;

test.afterEach(async ({ api }) => {
  await resetUserReactSettings(api.context);
});

for (const entity of cases) {
  test(`${entity.type}: user and assigned user filters support intersection, multiple users and clearing`, async ({
    page,
    api,
  }) => {
    test.setTimeout(90000);
    const { owner, other } = await ensureColumnFilterUsers(api.context);
    const label = formatUserLabel;

    const assignedColumn =
      entity.type === 'projects' ? 'assigned_to' : 'assigned_user';
    const assignedLabel =
      entity.type === 'projects' ? 'Assigned to' : 'Assigned User';
    await updateUserReactSettings(api.context, {
      react_table_columns: {
        [entity.resource]: [entity.field, 'user', assignedColumn],
      },
    });

    const prefix = uniqueName('user-filter');
    const names = [
      `${prefix}-owner`,
      `${prefix}-other`,
      `${prefix}-unassigned`,
    ];
    const client =
      entity.type === 'projects'
        ? await api.createEntity('clients', {
            name: uniqueName('project-client'),
          })
        : undefined;
    for (const [index, assignedId] of [owner.id, other.id, ''].entries()) {
      const record = await api.createEntity(entity.type, {
        [entity.field]: names[index],
        user_id: owner.id,
        assigned_user_id: entity.type === 'products' ? '' : assignedId,
        ...(client ? { client_id: client.id } : {}),
        ...(entity.type === 'tasks' ? { time_log: '[]' } : {}),
      });
      expect(record?.id, 'Fixture record was created').toBeTruthy();
      expect(record.user_id).toBe(owner.id);
      expect(record.assigned_user_id || '').toBe(
        entity.type === 'products' ? '' : assignedId
      );
    }

    await login(page);
    await page.goto(`/${entity.type}`);
    await expectTableListsOnly(page, names, []);

    async function change(
      action: () => Promise<void>,
      userIds: string[],
      assignedIds: string[],
      visible: number[]
    ) {
      await Promise.all([
        waitForEntityListRequest(page, `/api/v1/${entity.type}`, {
          user_ids: userIds,
          assigned_user_ids: assignedIds,
        }),
        action(),
      ]);
      await expectTableListsOnly(
        page,
        names.filter((_, index) => visible.includes(index)),
        names.filter((_, index) => !visible.includes(index))
      );
    }

    // Products do not expose assignment writes through the API. Verify their
    // unassigned records are excluded and restored, plus creator filtering.
    if (entity.type === 'products') {
      await change(
        () => applyColumnFilter(page, assignedLabel, [label(owner)]),
        [],
        [owner.id],
        []
      );
      await change(
        () => clearColumnFilter(page, assignedLabel),
        [],
        [],
        [0, 1, 2]
      );
      await change(
        () => applyColumnFilter(page, 'User', [label(other)]),
        [other.id],
        [],
        []
      );
      await change(
        () => applyColumnFilter(page, 'User', [label(owner)]),
        [other.id, owner.id],
        [],
        [0, 1, 2]
      );
      await change(() => clearColumnFilter(page, 'User'), [], [], [0, 1, 2]);
      return;
    }

    await change(
      () => applyColumnFilter(page, assignedLabel, [label(other)]),
      [],
      [other.id],
      [1]
    );
    await change(
      () => applyColumnFilter(page, assignedLabel, [label(owner)]),
      [],
      [other.id, owner.id],
      [0, 1]
    );
    await change(
      () => applyColumnFilter(page, 'User', [label(other)]),
      [other.id],
      [other.id, owner.id],
      []
    );
    await change(
      () => applyColumnFilter(page, 'User', [label(owner)]),
      [other.id, owner.id],
      [other.id, owner.id],
      [0, 1]
    );
    await change(
      () => clearColumnFilter(page, assignedLabel),
      [other.id, owner.id],
      [],
      [0, 1, 2]
    );
    await change(() => clearColumnFilter(page, 'User'), [], [], [0, 1, 2]);
  });
}

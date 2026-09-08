import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, type Page } from '@playwright/test';
import { keyboardShortcuts } from '$app/common/constants/keyboard-shortcuts';

const en = JSON.parse(
  fs.readFileSync(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../src/resources/lang/en/en.json'
    ),
    'utf8'
  )
) as Record<string, string>;

export interface KeyboardShortcutConfig {
  id: string;
  binding: string;
}

export function shortcutLabel(id: string): string {
  const definition = keyboardShortcuts.find((shortcut) => shortcut.id === id);

  if (!definition) {
    throw new Error(`Unknown keyboard shortcut id: ${id}`);
  }

  const label = en[definition.labelKey as keyof typeof en];

  if (!label) {
    throw new Error(`Missing translation for ${definition.labelKey}`);
  }

  return label;
}

function shortcutListButton(page: Page, label: string) {
  // The status dot's title (e.g. "no_shortcut_set") is included in the
  // button's accessible name, so match on the label span instead.
  return page.getByRole('button').filter({
    has: page.locator('span.truncate').getByText(label, { exact: true }),
  });
}

function shortcutDetailPanel(page: Page, label: string) {
  return page
    .locator('div.w-full.flex.flex-col.items-center.gap-3')
    .filter({ has: page.getByText(label, { exact: true }) });
}

async function pressBinding(page: Page, binding: string) {
  const parts = binding.split('+');
  const modifiers = parts.slice(0, -1);
  const key = parts[parts.length - 1];

  for (const modifier of modifiers) {
    await page.keyboard.down(modifier);
  }

  await page.keyboard.down(key);
  await page.keyboard.up(key);

  for (const modifier of [...modifiers].reverse()) {
    await page.keyboard.up(modifier);
  }

  // Recorder commits 500ms after the binding key is released.
  await page.waitForTimeout(600);
}

async function recordShortcutBinding(
  page: Page,
  label: string,
  binding: string
) {
  await shortcutListButton(page, label).click();

  const detail = shortcutDetailPanel(page, label);
  const recordButton = detail.locator('button.min-w-\\[12rem\\]');

  await recordButton.click();
  await pressBinding(page, binding);

  await expect(detail.getByRole('button', { name: 'Disable' })).toBeVisible({
    timeout: 5000,
  });
}

async function saveKeyboardShortcutPreferences(page: Page) {
  const preferencesSaved = page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' &&
      response.url().includes('/api/v1/company_users/') &&
      response.url().includes('/preferences') &&
      response.ok(),
    { timeout: 15000 }
  );

  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await preferencesSaved;
}

export async function clearKeyboardShortcuts(page: Page) {
  await page.goto('/settings/user_details/keyboard_shortcuts');
  await expect(page.locator('[data-cy="navigationBar"]')).toBeVisible({
    timeout: 10000,
  });

  await expect(
    shortcutListButton(page, shortcutLabel('create_client'))
  ).toBeVisible({ timeout: 10000 });

  const disableAll = page.getByRole('button', {
    name: 'Disable All',
    exact: true,
  });

  if (await disableAll.isVisible()) {
    await disableAll.click();
    await saveKeyboardShortcutPreferences(page);
  }

  await page.goto('/dashboard');
  await expect(page.locator('[data-cy="navigationBar"]')).toBeVisible({
    timeout: 10000,
  });
}

export async function configureKeyboardShortcuts(
  page: Page,
  shortcuts: KeyboardShortcutConfig[]
) {
  await page.goto('/settings/user_details/keyboard_shortcuts');
  await expect(page.locator('[data-cy="navigationBar"]')).toBeVisible({
    timeout: 10000,
  });

  for (const shortcut of shortcuts) {
    await recordShortcutBinding(
      page,
      shortcutLabel(shortcut.id),
      shortcut.binding
    );
  }

  await saveKeyboardShortcutPreferences(page);
}

export async function expectShortcutDoesNotNavigate(
  page: Page,
  binding: string,
  blockedPath: string
) {
  await page.goto('/dashboard');
  await expect(page.locator('[data-cy="navigationBar"]')).toBeVisible({
    timeout: 10000,
  });

  await page.keyboard.press(binding);
  await page.waitForTimeout(500);

  expect(page.url()).not.toContain(blockedPath);
}

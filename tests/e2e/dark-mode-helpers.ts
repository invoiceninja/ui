import { expect, type Locator, type Page } from '@playwright/test';
import { type ApiContext, setUserDarkMode } from './api-helpers';
import { login } from './helpers';

/** Tailwind `text-gray-500` default — illegible on dark surfaces when hardcoded. */
export const TAILWIND_GRAY_500 = 'rgb(107, 114, 128)';

/** Tailwind `text-gray-600` — another common hardcoded secondary text color. */
export const TAILWIND_GRAY_600 = 'rgb(75, 85, 99)';

/** Tailwind `text-gray-900` — primary text that disappears on dark backgrounds. */
export const TAILWIND_GRAY_900 = 'rgb(17, 24, 39)';

export async function enableDarkMode(api: ApiContext): Promise<void> {
  await setUserDarkMode(api, true, { quiet: true });
}

async function enableDarkModeInPreferences(page: Page): Promise<void> {
  await page.goto('/settings/user_details/preferences');
  await expect(page.getByText('Dark Mode', { exact: true })).toBeVisible({
    timeout: 15_000,
  });

  const toggle = page
    .locator('div')
    .filter({ has: page.getByText('Dark Mode', { exact: true }) })
    .getByRole('switch')
    .first();

  if ((await toggle.getAttribute('aria-checked')) !== 'true') {
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/preferences') &&
          response.request().method() === 'PUT'
      ),
      toggle.click(),
    ]);
  }

  await expect(toggle).toHaveAttribute('aria-checked', 'true');
}

export async function loginWithDarkMode(
  page: Page,
  api: ApiContext
): Promise<void> {
  await enableDarkMode(api);
  await login(page);
  await enableDarkModeInPreferences(page);
  await expectDarkModeActive(page);
}

export async function expectDarkModeActive(page: Page): Promise<void> {
  await page.goto('/settings/user_details/preferences');
  const toggle = page
    .locator('div')
    .filter({ has: page.getByText('Dark Mode', { exact: true }) })
    .getByRole('switch')
    .first();

  await expect(toggle).toHaveAttribute('aria-checked', 'true');
}

export async function readContrastRatio(locator: Locator): Promise<number> {
  return locator.evaluate((element) => {
    const parse = (color: string): [number, number, number] | null => {
      const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);

      if (!match) {
        return null;
      }

      return [Number(match[1]), Number(match[2]), Number(match[3])];
    };

    const luminance = (r: number, g: number, b: number) => {
      const channel = (value: number) => {
        const normalized = value / 255;

        return normalized <= 0.03928
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      };

      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };

    const ratio = (
      foreground: [number, number, number],
      background: [number, number, number]
    ) => {
      const fg = luminance(...foreground);
      const bg = luminance(...background);
      const lighter = Math.max(fg, bg);
      const darker = Math.min(fg, bg);

      return (lighter + 0.05) / (darker + 0.05);
    };

    const background = (el: Element): [number, number, number] => {
      let node: Element | null = el;

      while (node) {
        const backgroundColor = getComputedStyle(node).backgroundColor;
        const parsed = parse(backgroundColor);

        if (
          parsed &&
          backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          backgroundColor !== 'transparent'
        ) {
          return parsed;
        }

        node = node.parentElement;
      }

      return [255, 255, 255];
    };

    const foreground = parse(getComputedStyle(element).color);

    if (!foreground) {
      throw new Error(`Could not parse foreground color on ${element.tagName}`);
    }

    return ratio(foreground, background(element));
  });
}

export async function expectNotHardcodedGrayText(
  locator: Locator,
  ...forbidden: string[]
): Promise<void> {
  await expect(locator).toBeVisible();
  const color = await locator.evaluate((el) => getComputedStyle(el).color);

  for (const value of forbidden) {
    expect(color, `expected text not to use ${value}`).not.toBe(value);
  }
}

export async function expectReadableText(
  locator: Locator,
  minContrastRatio = 4.5
): Promise<void> {
  await expect(locator).toBeVisible();
  const ratio = await readContrastRatio(locator);
  expect(
    ratio,
    `expected contrast ratio >= ${minContrastRatio}, got ${ratio}`
  ).toBeGreaterThanOrEqual(minContrastRatio);
}

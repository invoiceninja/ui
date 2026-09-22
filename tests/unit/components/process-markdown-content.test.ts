/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { describe, expect, test } from 'vitest';
import {
  DOCS_SITE,
  DOCS_STATIC,
  processMarkdownContent,
} from '../../../src/components/help-widget/process-markdown-content';

describe('processMarkdownContent', () => {
  test('strips leading frontmatter without removing later horizontal rules', () => {
    const result = processMarkdownContent(`---
title: "Import and Export"
sidebar_position: 3
---
## Import Data

---

Keep this section.
`);

    expect(result).not.toContain('sidebar_position');
    expect(result).toContain('## Import Data');
    expect(result).toContain('Keep this section.');
    expect(result).toMatch(/---\n\nKeep this section/);
  });

  test('strips MDX imports and JSX components', () => {
    const result = processMarkdownContent(`---
title: Taxes
---
import VideoPlayer from "@site/src/components/VideoPlayer";
import { Foo, Bar } from "@site/src/components/Example";

<VideoPlayer src="/assets/videos/taxes/tax.mpd" isDash={true} id="tax-video" />

## Manual Taxes

Learn how to configure taxes.
`);

    expect(result).not.toContain('import VideoPlayer');
    expect(result).not.toContain('import { Foo');
    expect(result).not.toContain('<VideoPlayer');
    expect(result).toContain('## Manual Taxes');
  });

  test('converts Docusaurus admonitions including titled ones', () => {
    const result =
      processMarkdownContent(`:::warning Unit prices must never be negative
Always enter a positive **Unit Price**.

- For a negative invoice, use a negative **Quantity**.
:::

:::info
If you use Peppol, extra VAT numbers can be stored.
:::
`);

    expect(result).toContain('> **Unit prices must never be negative**');
    expect(result).toContain('> Always enter a positive **Unit Price**.');
    expect(result).toContain('> - For a negative invoice');
    expect(result).toContain('> **Info**');
    expect(result).toContain('> If you use Peppol');
    expect(result).not.toContain(':::warning');
    expect(result).not.toContain(':::info');
  });

  test('rewrites root-relative images and docs links', () => {
    const result =
      processMarkdownContent(`![CSV Imports](/assets/images/settings/import_overview.png "CSV Imports")

See the [report](/docs/user-guide/reports) page.
`);

    expect(result).toContain(
      `![CSV Imports](${DOCS_STATIC}/assets/images/settings/import_overview.png)`
    );
    expect(result).toContain(`[report](${DOCS_SITE}/docs/user-guide/reports)`);
  });

  test('rewrites HTML images and leaves fenced code alone', () => {
    const result =
      processMarkdownContent(`<img class="" src="/assets/images/einvoices/zugferd.png" alt="ZUGFeRD"/>

\`\`\`bash
import VideoPlayer from "@site/src/components/VideoPlayer";
Settings > Backup | Restore
\`\`\`
`);

    expect(result).toContain(
      `src="${DOCS_STATIC}/assets/images/einvoices/zugferd.png"`
    );
    expect(result).toContain(
      'import VideoPlayer from "@site/src/components/VideoPlayer";'
    );
  });

  test('keeps GFM tables intact', () => {
    const result = processMarkdownContent(`| CSV Value | Result |
|-----------|--------|
| \`draft\` | Draft |
| \`sent\` | Sent |
`);

    expect(result).toContain('| CSV Value | Result |');
    expect(result).toContain('| `draft` | Draft |');
  });
});

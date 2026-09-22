/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const DOCS_SITE = 'https://invoiceninja.github.io';
export const DOCS_STATIC =
  'https://raw.githubusercontent.com/invoiceninja/invoiceninja.github.io/refs/heads/v5-rework/static';

const ADMONITION_TITLES: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  info: 'Info',
  warning: 'Warning',
  danger: 'Danger',
  caution: 'Caution',
  important: 'Important',
};

const CODE_SEGMENT = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`]+`)/g;

function mapOutsideCode(content: string, transform: (value: string) => string) {
  return content
    .split(CODE_SEGMENT)
    .map((segment) => {
      if (
        segment.startsWith('```') ||
        segment.startsWith('~~~') ||
        (segment.startsWith('`') && segment.endsWith('`'))
      ) {
        return segment;
      }

      return transform(segment);
    })
    .join('');
}

export function rewriteAssetUrl(src: string) {
  if (!src || /^https?:\/\//i.test(src) || src.startsWith('data:')) {
    return src;
  }

  const path = src.startsWith('/') ? src : `/${src}`;

  return `${DOCS_STATIC}${path}`;
}

export function rewriteDocsHref(href: string) {
  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    /^https?:\/\//i.test(href)
  ) {
    return href;
  }

  if (href.startsWith('/assets/') || href.startsWith('/static/')) {
    return rewriteAssetUrl(href);
  }

  if (href.startsWith('/')) {
    return `${DOCS_SITE}${href}`;
  }

  return href;
}

function stripFrontmatter(content: string) {
  return content.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function stripMdxImports(content: string) {
  return content
    .replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^import\s+(?:type\s+)?[\w*\s,]+from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(
      /^import\s+(?:type\s+)?\{[\s\S]*?\}\s+from\s+['"][^'"]+['"];?\s*$/gm,
      ''
    )
    .replace(/^export\s+\{[\s\S]*?\};?\s*$/gm, '');
}

function stripJsxComponents(content: string) {
  return content
    .replace(/<[A-Z][A-Za-z0-9.]*\b[^>]*\/>/g, '')
    .replace(/<[A-Z][A-Za-z0-9.]*\b[^>]*>[\s\S]*?<\/[A-Z][A-Za-z0-9.]*>/g, '')
    .replace(/<\/?x-[\w-]+[^>]*>/g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

function convertAdmonitions(content: string) {
  return content.replace(
    /^:::(note|tip|info|warning|danger|caution|important)(?:[ \t]+([^\n]+))?\n([\s\S]*?)^:::\s*$/gm,
    (_match, type: string, title: string | undefined, body: string) => {
      const heading = title?.trim() || ADMONITION_TITLES[type] || type;
      const quotedBody = body
        .replace(/\n+$/, '')
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');

      return `> **${heading}**\n${quotedBody}`;
    }
  );
}

function rewriteMarkdownImages(content: string) {
  return content.replace(
    /!\[([^\]]*)\]\(\s*<?([^>\s)]+)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g,
    (_match, alt: string, src: string) => `![${alt}](${rewriteAssetUrl(src)})`
  );
}

function rewriteHtmlImages(content: string) {
  return content.replace(
    /<img\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>/gi,
    (_match, before: string, src: string, after: string) =>
      `<img${before}src="${rewriteAssetUrl(src)}"${after}>`
  );
}

function rewriteMarkdownLinks(content: string) {
  return content.replace(
    /\[([^\]]+)\]\(\s*<?([^>\s)]+)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g,
    (match, text: string, href: string) => {
      if (match.startsWith('![')) {
        return match;
      }

      return `[${text}](${rewriteDocsHref(href)})`;
    }
  );
}

function rewriteHtmlHrefs(content: string) {
  return content.replace(
    /\bhref=["']([^"']+)["']/gi,
    (_match, href: string) => `href="${rewriteDocsHref(href)}"`
  );
}

export function processMarkdownContent(content: string) {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');

  return mapOutsideCode(stripFrontmatter(normalized), (segment) => {
    let next = stripMdxImports(segment);
    next = stripJsxComponents(next);
    next = convertAdmonitions(next);
    next = rewriteMarkdownImages(next);
    next = rewriteHtmlImages(next);
    next = rewriteMarkdownLinks(next);
    next = rewriteHtmlHrefs(next);

    return next.replace(/\n{3,}/g, '\n\n');
  }).trim();
}

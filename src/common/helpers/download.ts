/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

// Currently used by account-management invoice downloads; broader blob download
// migrations should happen in a focused follow-up PR.
export function extractFilenameFromContentDisposition(
  contentDisposition?: string | string[] | null
) {
  const header = Array.isArray(contentDisposition)
    ? contentDisposition[0]
    : contentDisposition;

  if (!header) {
    return '';
  }

  const encodedFilename = header.match(/filename\*=UTF-8''([^;]+)/);

  if (encodedFilename?.[1]) {
    return decodeURIComponent(encodedFilename[1]);
  }

  const filename = header.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);

  return filename?.[1]?.replace(/['"]/g, '') || '';
}

export function extractFilenameFromHeaders(
  headers?: Record<string, unknown> | null
) {
  const contentDisposition =
    headers?.['content-disposition'] || headers?.['Content-Disposition'];

  if (
    typeof contentDisposition === 'string' ||
    Array.isArray(contentDisposition)
  ) {
    return extractFilenameFromContentDisposition(contentDisposition);
  }

  return '';
}

export function downloadBlob(
  data: BlobPart,
  filename: string,
  contentType = 'application/octet-stream'
) {
  const blob = new Blob([data], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.download = filename;
  link.href = url;
  link.target = '_blank';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function downloadUrl(url: string) {
  const link = document.createElement('a');

  link.href = url;
  link.target = '_blank';
  link.rel = 'noreferrer';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

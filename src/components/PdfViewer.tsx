/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Props {
  url: string;
  height?: number;
}

export function PdfViewer({ url, height = 1500 }: Props) {
  return <iframe src={url} width="100%" height={height} />;
}

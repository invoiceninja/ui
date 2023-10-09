/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtom } from 'jotai';
import { templatePdfUrlAtom } from '../../../custom-designs/helpers/templates';
import { PdfViewer } from '$app/components/PdfViewer';

export default function Pdf() {
  const [pdfUrl] = useAtom(templatePdfUrlAtom);

  if (pdfUrl === null) {
    return null;
  }

  return <PdfViewer url={pdfUrl} />;
}

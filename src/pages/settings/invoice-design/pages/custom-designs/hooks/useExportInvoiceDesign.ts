/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { toast } from '$app/common/helpers/toast/toast';
import { trans } from '$app/common/helpers';
import { useTranslation } from 'react-i18next';
import { Design } from '$app/common/interfaces/design';

export function useExportInvoiceDesign() {
  const [t] = useTranslation();

  return (design: Design) => {
    const handleExportToTxtFile = () => {
      if (design) {
        const blob = new Blob([JSON.stringify(design.design)], {
          type: 'text/plain',
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.download = `${design.name}_${t('export').toLowerCase()}`;
        link.href = url;
        link.target = '_blank';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
      }
    };

    if (!navigator.clipboard) {
      return handleExportToTxtFile();
    }

    if (design) {
      navigator.clipboard
        .writeText(JSON.stringify(design.design))
        .then(() =>
          toast.success(
            trans('copied_to_clipboard', {
              value: t('design').toLowerCase(),
            })
          )
        )
        .catch(() => handleExportToTxtFile());
    }
  };
}

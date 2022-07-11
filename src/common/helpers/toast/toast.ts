/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { t } from 'i18next';
import { toast as helper } from 'react-hot-toast';

class Toast {
  protected declare currentId: string;

  processing(): Toast {
    this.currentId = helper.loading(t('processing', {}), {
      id: this.currentId,
    });

    return this;
  }

  success(message = 'success'): Toast {
    this.currentId = helper.success(t(message), { id: this.currentId });

    return this;
  }

  error(message = 'error_title'): Toast {
    this.currentId = helper.error(t(message), { id: this.currentId });

    return this;
  }
}

export const toast = new Toast();

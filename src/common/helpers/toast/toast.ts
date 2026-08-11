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
import React from 'react';
import { toast as helper } from 'react-hot-toast';
import { MdInfoOutline } from 'react-icons/md';
import { trans } from '$app/common/helpers';

class Toast {
  protected declare currentId: string;

  processing(): Toast {
    this.currentId = helper.loading(t('processing', {}), {
      id: this.currentId,
    });

    return this;
  }

  success(message = 'success', replaceable = {}): Toast {
    this.currentId = helper.success(trans(message, replaceable), {
      id: this.currentId,
    });

    return this;
  }

  error(message = 'error_title'): Toast {
    this.currentId = helper.error(t(message), { id: this.currentId });

    return this;
  }

  info(message: string, replaceable = {}, duration = 8000): Toast {
    if (this.currentId) {
      helper.dismiss(this.currentId);
    }

    this.currentId = helper(trans(message, replaceable), {
      duration,
      icon: React.createElement(MdInfoOutline, {
        size: 20,
        color: '#3b82f6',
      }),
    });

    return this;
  }

  dismiss(): Toast {
    helper.dismiss(this.currentId);

    return this;
  }
}

export const toast = new Toast();

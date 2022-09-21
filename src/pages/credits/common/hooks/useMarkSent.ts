/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { Credit } from 'common/interfaces/credit';

export function useMarkSent() {
  return (credit: Credit) => {
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/credits/:id?mark_sent=true', { id: credit.id }),
      credit
    )
      .then(() => {
        toast.success('updated_credit');
      })
      .catch((error) => {
        console.error(error);

        toast.error();
      });
  };
}

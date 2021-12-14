/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useProductQuery } from 'common/queries/products';
import { Settings } from 'components/layouts/Settings';
import { Spinner } from 'components/Spinner';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Edit() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('payment_terms')}`;
  });

  const { id } = useParams();
  const { data: paymentTerm } = useProductQuery({ id });

  console.log(paymentTerm);

  return (
    <Settings title={t('payment_terms')}>
      {!paymentTerm && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
    </Settings>
  );
}

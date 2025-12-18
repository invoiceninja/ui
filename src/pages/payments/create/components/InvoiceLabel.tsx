import { route } from '$app/common/helpers/route';
import { useInvoiceResolver } from '$app/common/hooks/invoices/useInvoiceResolver';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { Invoice } from '$app/common/interfaces/invoice';
import { DynamicLink } from '$app/components/DynamicLink';
import { InputLabel } from '$app/components/forms';
import { Spinner } from '$app/components/Spinner';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  className?: string;
  invoiceId: string;
}

export function InvoiceLabel({ invoiceId, className }: Props) {
  const [t] = useTranslation();

  const disableNavigation = useDisableNavigation();

  const { find: findInvoice } = useInvoiceResolver();

  const [currentInvoice, setCurrentInvoice] = useState<Invoice>();

  useEffect(() => {
    if (invoiceId) {
      findInvoice(invoiceId).then((invoice) => setCurrentInvoice(invoice));
    }
  }, [invoiceId]);

  return (
    <div className={classNames('flex flex-col gap-y-3', className)}>
      <InputLabel>{t('invoice')}</InputLabel>

      {currentInvoice ? (
        <DynamicLink
          to={route('/invoices/:id/edit', { id: invoiceId })}
          renderSpan={disableNavigation('invoice', currentInvoice)}
        >
          #{currentInvoice.number}
        </DynamicLink>
      ) : (
        <Spinner />
      )}
    </div>
  );
}

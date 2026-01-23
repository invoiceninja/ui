import { MdWarning } from 'react-icons/md';
import { Icon } from './icons/Icon';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Invoice } from '$app/common/interfaces/invoice';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Credit } from '$app/common/interfaces/credit';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import reactStringReplace from 'react-string-replace';
import { useTranslation } from 'react-i18next';
import { Link } from './forms';
import classNames from 'classnames';

interface Props {
  className?: string;
  resource: Invoice | RecurringInvoice | Credit | PurchaseOrder;
}

export function HiddenResourceTaxesAlert({ resource, className }: Props) {
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const isAnyTaxHidden = () => {
    const hasAnyLineItemTaxes = resource.line_items.some(
      (lineItem) =>
        lineItem.tax_name1 || lineItem.tax_name2 || lineItem.tax_name3
    );

    if (company.enabled_item_tax_rates === 0 && hasAnyLineItemTaxes) {
      return true;
    }

    return false;
  };

  if (!isAnyTaxHidden()) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex items-center space-x-3 rounded-lg bg-[#FCD34D66] px-3 py-3.5 border',
        className
      )}
      style={{ borderColor: '#FCD34D' }}
    >
      <div>
        <Icon element={MdWarning} size={20} color="orange" />
      </div>

      <div className="text-sm font-medium">
        {reactStringReplace(
          t('hidden_taxes_warning') as string,
          ':link',
          () => (
            <Link to="/settings/tax_settings">{t('settings')}</Link>
          )
        )}
      </div>
    </div>
  );
}

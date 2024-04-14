/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Payment } from '$app/common/interfaces/payment';
import { useBulk } from '$app/common/queries/payments';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useChangeTemplate } from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { useTranslation } from 'react-i18next';
import { MdDesignServices, MdSend } from 'react-icons/md';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const bulk = useBulk();

  const showEmailPaymentAction = (payments: Payment[]) => {
    return payments.every(({ client }) =>
      client?.contacts.some(({ email }) => email)
    );
  };

  const { setChangeTemplateVisible, setChangeTemplateResources } =
    useChangeTemplate();

  const customBulkActions: CustomBulkAction<Payment>[] = [
    ({ selectedResources, selectedIds, setSelected }) =>
      showEmailPaymentAction(selectedResources) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'email');
            setSelected([]);
          }}
          icon={<Icon element={MdSend} />}
        >
          {t('email_payment')}
        </DropdownElement>
      ),
    ({ selectedResources }) => (
      <DropdownElement
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources(selectedResources);
        }}
        icon={<Icon element={MdDesignServices} />}
      >
        {t('run_template')}
      </DropdownElement>
    ),
  ];

  return customBulkActions;
};

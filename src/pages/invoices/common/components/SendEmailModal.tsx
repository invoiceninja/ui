/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { trans } from '$app/common/helpers';
import { useBulk } from '$app/common/queries/invoices';
import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  invoiceIds: string[];
  setSelected: (id: string[]) => void;
}

export type EmailType =
  | 'invoice'
  | 'reminder1'
  | 'reminder2'
  | 'reminder3'
  | 'reminder_endless';

interface Type {
  label: string;
  value: EmailType;
}

const TYPES: Type[] = [
  { label: 'initial_email', value: 'invoice' },
  { label: 'first_reminder', value: 'reminder1' },
  { label: 'second_reminder', value: 'reminder2' },
  { label: 'third_reminder', value: 'reminder3' },
  { label: 'endless_reminder', value: 'reminder_endless' },
];

export function SendEmailModal(props: Props) {
  const { visible, setVisible, invoiceIds } = props;

  const [t] = useTranslation();

  const bulk = useBulk({ onSuccess: () => setVisible(false) });

  return (
    <Modal
      title={trans('email_count_invoices', { count: invoiceIds.length })}
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <div>
        {TYPES.map((type, index) => (
          <div
            key={index}
            className="flex justify-between py-2 cursor-pointer hover:bg-gray-100 pl-2"
            onClick={() => {
              bulk(invoiceIds, 'email', type.value);
              props.setSelected([]);
            }}
          >
            {t(type.label)}
          </div>
        ))}
      </div>
    </Modal>
  );
}

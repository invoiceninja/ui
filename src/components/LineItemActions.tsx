/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Fragment, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDelete, MdMoreVert } from 'react-icons/md';

export type LineItemAction = (lineItem: InvoiceItem) => ReactNode;

interface Props {
  lineItem: InvoiceItem;
  actions: LineItemAction[];
  onLineItemDelete: () => void;
}

export function LineItemActions(props: Props) {
  const [t] = useTranslation();

  const { lineItem, onLineItemDelete, actions } = props;

  return (
    <Dropdown labelElement={<Icon element={MdMoreVert} size={23} />}>
      {actions.map((action, index) => (
        <Fragment key={index}>{action(lineItem)}</Fragment>
      ))}

      <DropdownElement
        icon={<Icon element={MdDelete} />}
        onClick={onLineItemDelete}
        setVisible={() => false}
      >
        {t('delete')}
      </DropdownElement>
    </Dropdown>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '$app/common/interfaces/client';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdGroup } from 'react-icons/md';

interface Props {
  clients: Client[];
}
export function AssignToGroupBulkAction(props: Props) {
  const [t] = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { clients } = props;

  return (
    <DropdownElement onClick={() => {}} icon={<Icon element={MdGroup} />}>
      {t('assign_to_group')}
    </DropdownElement>
  );
}

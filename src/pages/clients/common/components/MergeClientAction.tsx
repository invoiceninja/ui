/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiGitMerge } from 'react-icons/bi';
import { Client } from '$app/common/interfaces/client';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MergeClientModal } from './MergeClientModal';

interface Props {
  client: Client;
  setIsPurgeOrMergeActionCalled?: Dispatch<SetStateAction<boolean>>;
}
export function MergeClientAction(props: Props) {
  const [t] = useTranslation();

  const { client, setIsPurgeOrMergeActionCalled } = props;

  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);

  return (
    <>
      <DropdownElement
        onClick={() => setIsMergeModalOpen(true)}
        icon={<Icon element={BiGitMerge} />}
      >
        {t('merge')}
      </DropdownElement>

      <MergeClientModal
        visible={isMergeModalOpen}
        setVisible={setIsMergeModalOpen}
        mergeFromClientId={client.id}
        setIsPurgeOrMergeActionCalled={setIsPurgeOrMergeActionCalled}
      />
    </>
  );
}

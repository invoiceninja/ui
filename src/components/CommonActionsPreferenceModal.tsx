/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction } from 'react';
import { Modal } from './Modal';
import { useTranslation } from 'react-i18next';

export interface CommonAction {
  value: string;
  label: string;
}

interface Props {
  entity: 'invoice';
  defaultCommonActions: CommonAction[];
  allCommonActions: CommonAction[];
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function CommonActionsPreferenceModal(props: Props) {
  const [t] = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { entity, allCommonActions, visible, setVisible } = props;

  return (
    <>
      <Modal
        title={`${t('invoice')} ${t('actions')} ${t('preferences')}`}
        visible={visible}
        onClose={() => setVisible(false)}
      ></Modal>
    </>
  );
}

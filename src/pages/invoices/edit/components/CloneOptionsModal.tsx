/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}
export function CloneOptionsModal(props: Props) {
  const [t] = useTranslation();

  const { visible, setVisible } = props;

  return (
    <Modal
      title={t('clone_options')}
      visible={visible}
      onClose={() => setVisible(false)}
    ></Modal>
  );
}

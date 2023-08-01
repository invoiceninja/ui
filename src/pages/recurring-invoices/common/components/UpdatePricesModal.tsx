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
import { Button } from '$app/components/forms';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  handleSave: () => void;
}
export const UpdatePricesModal = (props: Props) => {
  const [t] = useTranslation();

  const { visible, setVisible, handleSave } = props;

  return (
    <Modal
      title={t('update_prices')}
      visible={visible}
      onClose={() => setVisible(false)}
      backgroundColor="white"
    >
      <span className="text-lg text-gray-900">{t('are_you_sure')}</span>

      <Button className="self-end" onClick={handleSave}>
        {t('yes')}
      </Button>
    </Modal>
  );
};

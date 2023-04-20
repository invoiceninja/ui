/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { toast } from '$app/common/helpers/toast/toast';
import { Parts } from '$app/common/interfaces/design';
import { Modal } from '$app/components/Modal';
import { Button, InputField } from '$app/components/forms';
import { atom, useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onImport: (parts: Parts) => unknown;
}

export const importModalVisiblityAtom = atom(false);

export function Import({ onImport }: Props) {
  const [isVisible, setIsVisible] = useAtom(importModalVisiblityAtom);
  const [content, setContent] = useState('');

  const { t } = useTranslation();

  const handle = () => {
    try {
      const parts: Parts = JSON.parse(content);

      if (!Object.hasOwn(parts, 'product')) {
        parts.product = '';
      }

      if (!Object.hasOwn(parts, 'task')) {
        parts.task = '';
      }

      onImport(parts);
      setIsVisible(false);
      setContent('');
    } catch (error) {
      console.error(error);

      toast.error();
    }
  };

  return (
    <Modal
      title={t('import_design')}
      visible={isVisible}
      onClose={setIsVisible}
    >
      <InputField
        element="textarea"
        onValueChange={(value) => setContent(value)}
      />

      <Button onClick={handle}>{t('import')}</Button>
    </Modal>
  );
}

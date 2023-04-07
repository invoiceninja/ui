/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Design } from '$app/common/interfaces/design';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { Button, InputField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import {
  useDesignActions,
  useHandleDesignSave,
} from '$app/pages/settings/invoice-design/customize/common/hooks';
import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const isModalVisibleAtom = atom(false);
export const validationBagAtom = atom<ValidationBag | null>(null);

interface Props {
  design: Design | null;
  setDesign: (design: Design | null) => void;
}

export function EditModal({ design, setDesign }: Props) {
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useAtom(isModalVisibleAtom);
  const [validationBag] = useAtom(validationBagAtom);

  const handleUpdate = useHandleDesignSave();
  const actions = useDesignActions();

  return (
    <Modal title={t('edit_design')} visible={isVisible} onClose={setIsVisible}>
      <InputField
        label={t('name')}
        value={design?.name}
        onValueChange={(name) => design && setDesign({ ...design, name })}
        errorMessage={validationBag?.errors.name}
      />

      <div className="flex items-center justify-end space-x-2">
        <Button onClick={() => design && handleUpdate(design)}>
          {t('save')}
        </Button>

        <Dropdown label={t('more_actions')}>
          {actions.map((action) => design && action(design))}
        </Dropdown>
      </div>
    </Modal>
  );
}

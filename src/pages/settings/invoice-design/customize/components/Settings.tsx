/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DesignSelector } from '$app/common/generic/DesignSelector';
import { trans } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { Design, Parts } from '$app/common/interfaces/design';
import { Card, ClickableElement, Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Button, InputField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import {
  Payload,
  useDesignUtilities,
} from '$app/pages/settings/invoice-design/customize/common/hooks';
import {
  EditModal,
  isModalVisibleAtom,
} from '$app/pages/settings/invoice-design/customize/components/EditModal';
import { atom, useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface CustomizeChildProps {
  payload: Payload;
}

export const designAtom = atom<Design | null>(null);

export function Settings({ payload }: CustomizeChildProps) {
  const { t } = useTranslation();
  const { handleDesignChange, handleDesignPropertyChange } =
    useDesignUtilities();

  const [importContent, setImportContent] = useState('');
  const [isImportVisible, setIsImportVisible] = useState(false);

  const handleImport = () => {
    try {
      const parts: Parts = JSON.parse(importContent);

      if (!Object.hasOwn(parts, 'product')) {
        parts.product = '';
      }

      if (!Object.hasOwn(parts, 'task')) {
        parts.task = '';
      }

      handleDesignPropertyChange('design', parts);
      setImportContent('');
      setIsImportVisible(false);
    } catch (error) {
      console.error(error);

      toast.error();
    }
  };

  const handleExport = () => {
    if (payload.design) {
      navigator.clipboard.writeText(JSON.stringify(payload.design));

      toast.success(
        trans('copied_to_clipboard', { value: t('design').toLowerCase() })
      );
    }
  };

  const [design, setDesign] = useAtom(designAtom);
  const [, setIsEditDesignModalVisible] = useAtom(isModalVisibleAtom);

  return (
    <div className="space-y-4">
      <Modal
        title={t('import_design')}
        visible={isImportVisible}
        onClose={setIsImportVisible}
      >
        <InputField
          element="textarea"
          onValueChange={(value) => setImportContent(value)}
        />

        <Button onClick={handleImport}>{t('import')}</Button>
      </Modal>

      <EditModal design={design} setDesign={setDesign} />

      <Card title={t('settings')} padding="small" collapsed={false}>
        <Element leftSide={t('design')}>
          <div className="space-y-2">
            <DesignSelector
              onChange={(design) => {
                handleDesignChange(
                  design,
                  design.is_custom ? 'custom' : 'stock'
                );

                setDesign(design);
              }}
            />

            {design?.is_custom && (
              <Button
                behavior="button"
                type="minimal"
                onClick={() => setIsEditDesignModalVisible(true)}
              >
                {t('edit')}
              </Button>
            )}
          </div>
        </Element>

        {/* <Element leftSide={t('html_mode')}>
          <Toggle checked={false} />
        </Element> */}

        <Divider />

        <ClickableElement href="https://invoiceninja.github.io/docs/custom-fields/">
          {t('view_docs')}
        </ClickableElement>

        <ClickableElement onClick={() => setIsImportVisible(true)}>
          {t('import')}
        </ClickableElement>

        <ClickableElement onClick={handleExport}>
          {t('export')}
        </ClickableElement>
      </Card>
    </div>
  );
}

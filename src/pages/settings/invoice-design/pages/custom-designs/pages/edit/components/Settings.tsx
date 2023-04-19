/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Card, ClickableElement, Element } from '$app/components/cards';
import { DesignSelector } from '$app/common/generic/DesignSelector';
import { InputField } from '$app/components/forms';
import { Divider } from '$app/components/cards/Divider';
import { useCallback } from 'react';
import { toast } from '$app/common/helpers/toast/toast';
import { trans } from '$app/common/helpers';
import { useAtom } from 'jotai';
import { payloadAtom } from '../Edit';
import { Import, importModalVisiblityAtom } from './Import';
import { useDesignUtilities } from '../common/hooks';

export function Settings() {
  const { t } = useTranslation();

  const [payload] = useAtom(payloadAtom);
  const [, setIsImportModalVisible] = useAtom(importModalVisiblityAtom);

  const handleExport = useCallback(() => {
    if (payload.design) {
      navigator.clipboard.writeText(JSON.stringify(payload.design));

      toast.success(
        trans('copied_to_clipboard', {
          value: t('payload.design').toLowerCase(),
        })
      );
    }
  }, [payload.design]);

  const { handlePropertyChange } = useDesignUtilities();

  return (
    <>
      <Import onImport={(parts) => console.log(parts)} />

      <Card title={t('settings')} padding="small" collapsed={false}>
        <Element leftSide={t('name')}>
          <InputField
            value={payload.design?.name}
            onValueChange={(value) => handlePropertyChange('name', value)}
          />
        </Element>

        <Element leftSide={t('design')}>
          <DesignSelector
            onChange={(design) => handlePropertyChange('design', design.design)}
            actionVisibility={false}
          />
        </Element>

        <Divider />

        <ClickableElement href="https://invoiceninja.github.io/docs/custom-fields/">
          {t('view_docs')}
        </ClickableElement>

        <ClickableElement onClick={() => setIsImportModalVisible(true)}>
          {t('import')}
        </ClickableElement>

        <ClickableElement onClick={handleExport}>
          {t('export')}
        </ClickableElement>
      </Card>
    </>
  );
}

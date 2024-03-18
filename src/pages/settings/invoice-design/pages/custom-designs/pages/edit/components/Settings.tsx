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
import { Checkbox, InputField } from '$app/components/forms';
import { Divider } from '$app/components/cards/Divider';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { toast } from '$app/common/helpers/toast/toast';
import { trans } from '$app/common/helpers';
import { useAtom } from 'jotai';
import { payloadAtom } from '../Edit';
import { Import, importModalVisiblityAtom } from './Import';
import { useDesignUtilities } from '../common/hooks';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import Toggle from '$app/components/forms/Toggle';
import { templateEntites } from '../../create/Create';

interface Props {
  errors: ValidationBag | undefined;
  isFormBusy: boolean;
  shouldRenderHTML: boolean;
  setShouldRenderHTML: Dispatch<SetStateAction<boolean>>;
}

export function Settings(props: Props) {
  const { t } = useTranslation();

  const { errors } = props;

  const [payload] = useAtom(payloadAtom);
  const [, setIsImportModalVisible] = useAtom(importModalVisiblityAtom);

  const handleExportToTxtFile = () => {
    if (payload.design) {
      const blob = new Blob([JSON.stringify(payload.design.design)], {
        type: 'text/plain',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.download = `${payload.design.name}_${t('export').toLowerCase()}`;
      link.href = url;
      link.target = '_blank';

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    }
  };

  const handleExport = useCallback(() => {
    if (!navigator.clipboard) {
      return handleExportToTxtFile();
    }

    if (payload.design) {
      navigator.clipboard
        .writeText(JSON.stringify(payload.design.design))
        .then(() =>
          toast.success(
            trans('copied_to_clipboard', {
              value: t('design').toLowerCase(),
            })
          )
        )
        .catch(() => handleExportToTxtFile());
    }
  }, [payload.design]);

  const { handlePropertyChange, handleResourceChange } = useDesignUtilities();

  return (
    <>
      <Import onImport={(parts) => handlePropertyChange('design', parts)} />

      <Card title={t('settings')} padding="small" collapsed={false}>
        <Element leftSide={t('name')}>
          <InputField
            value={payload.design?.name}
            onValueChange={(value) => handlePropertyChange('name', value)}
            errorMessage={errors?.errors.name}
          />
        </Element>

        <Element leftSide={t('resource')}>
          {templateEntites.map((entity) => (
            <Checkbox
              key={entity}
              label={t(entity)}
              value={entity}
              onValueChange={(value, checked) =>
                handleResourceChange(value, Boolean(checked))
              }
              checked={payload.design?.entities.includes(entity)}
            />
          ))}
        </Element>

        <Element leftSide={t('design')}>
          <DesignSelector
            onChange={(design) => handlePropertyChange('design', design.design)}
            actionVisibility={false}
            errorMessage={
              errors?.errors['design.header'] ||
              errors?.errors['design.body'] ||
              errors?.errors['design.footer'] ||
              errors?.errors['design.includes']
            }
          />
        </Element>

        <Divider />

        <ClickableElement href="https://invoiceninja.github.io/en/custom-fields/">
          {t('view_docs')}
        </ClickableElement>

        <ClickableElement onClick={() => setIsImportModalVisible(true)}>
          {t('import')}
        </ClickableElement>

        <ClickableElement onClick={handleExport}>
          {t('export')}
        </ClickableElement>

        <Element leftSide={t('html_mode')}>
          <Toggle
            checked={props.shouldRenderHTML}
            onChange={(value) => props.setShouldRenderHTML(value)}
            disabled={props.isFormBusy}
          />
        </Element>
      </Card>
    </>
  );
}

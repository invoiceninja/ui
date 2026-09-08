/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { cloneDeep, isEqual } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import {
  useReactSettings,
  useSaveReactSettings,
} from '$app/common/hooks/useReactSettings';
import { Button, InputField } from '../forms';
import { Modal } from '../Modal';
import { ImportMap } from './UploadImport';

interface Props {
  entity: string;
  importMap: ImportMap;
  onImport: () => Promise<void> | undefined;
}
export function ImportTemplateModal(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { onImport, importMap, entity } = props;

  const currentUser = useCurrentUser();
  const reactSettings = useReactSettings();
  const saveSettings = useSaveReactSettings();

  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] =
    useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] =
    useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>('');

  const handleOnClose = () => {
    setTemplateName('');
    setIsSaveTemplateModalOpen(false);
    navigate(`/${entity}s`);
  };

  const shouldOpenTemplateModal = () => {
    if (!reactSettings?.import_templates?.[entity]) {
      return true;
    }

    if (!Object.keys(importMap.column_map).length) {
      return false;
    }

    let isSameTemplateSaved = false;

    Object.values(reactSettings?.import_templates?.[entity]).forEach(
      (columnMap) => {
        if (
          isEqual(
            Object.values(columnMap).map((column) => column || ''),
            Object.values(importMap.column_map?.[entity]?.mapping).map(
              (column) => column || ''
            )
          )
        ) {
          isSameTemplateSaved = true;
        }
      }
    );

    return !isSameTemplateSaved;
  };

  const isTemplateNameDuplicated = () => {
    if (!reactSettings?.import_templates?.[entity]) {
      return false;
    }

    let isTemplateDuplicated = false;

    Object.keys(reactSettings?.import_templates?.[entity]).forEach(
      (currentTemplateName) => {
        if (currentTemplateName === templateName) {
          isTemplateDuplicated = true;
        }
      }
    );

    return isTemplateDuplicated;
  };

  const handleSaveTemplate = () => {
    if (!isFormBusy && templateName && currentUser) {
      const currentEntityImportTemplates = (cloneDeep(
        reactSettings?.import_templates?.[props.entity]
      ) || {}) as Record<string, Record<number, string>>;

      const updatedEntityImportTemplates: Record<string, (string | null)[]> =
        {};

      if (!Array.isArray(currentEntityImportTemplates)) {
        Object.entries(currentEntityImportTemplates).forEach(([key, value]) => {
          if (!key || !value || !Array.isArray(value)) return;

          updatedEntityImportTemplates[key] = value;
        });
      }

      updatedEntityImportTemplates[templateName] = Object.values(
        importMap.column_map?.[props.entity]?.mapping
      ).map((column) => column || '') as string[];

      toast.processing();
      setIsFormBusy(true);

      saveSettings(
        `import_templates.${props.entity}`,
        updatedEntityImportTemplates
      )
        .then(() => {
          toast.success('updated_settings');
          handleOnClose();
          navigate(`/${entity}s`);
        })
        .catch(() => toast.dismiss())
        .finally(() => setIsFormBusy(false));
    }
  };

  const handleOpenModal = () => {
    onImport()?.then(() =>
      shouldOpenTemplateModal()
        ? setIsTemplateModalOpen(true)
        : navigate(`/${entity}s`)
    );
  };

  return (
    <>
      <Button
        className="flex float-right"
        behavior="button"
        onClick={handleOpenModal}
      >
        {t('import')}
      </Button>

      <Modal
        title={t('save_as_template')}
        visible={isSaveTemplateModalOpen}
        onClose={handleOnClose}
      >
        <InputField
          label={t('name')}
          value={templateName}
          onValueChange={(value) => setTemplateName(value)}
          changeOverride
        />

        <Button
          behavior="button"
          onClick={handleSaveTemplate}
          disabled={!templateName || isTemplateNameDuplicated() || isFormBusy}
          disableWithoutIcon
        >
          {t('save')}
        </Button>
      </Modal>

      <Modal
        title={t('save_as_template')}
        visible={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false);
          navigate(`/${entity}s`);
        }}
      >
        <span className="font-medium text-base">{t('save_template_body')}</span>

        <div className="flex justify-between">
          <Button
            behavior="button"
            type="secondary"
            onClick={() => {
              setIsTemplateModalOpen(false);
              navigate(`/${entity}s`);
            }}
          >
            {t('no')}
          </Button>

          <Button
            behavior="button"
            onClick={() => {
              setIsTemplateModalOpen(false);
              setTimeout(() => {
                setIsSaveTemplateModalOpen(true);
              }, 310);
            }}
          >
            {t('yes')}
          </Button>
        </div>
      </Modal>
    </>
  );
}

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
import { Button, InputField } from '../forms';
import { ImportMap } from './UploadImport';
import { useState } from 'react';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { cloneDeep, isEqual, set } from 'lodash';
import { Modal } from '../Modal';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { $refetch } from '$app/common/hooks/useRefetch';
import { updateUser } from '$app/common/stores/slices/user';
import { useDispatch } from 'react-redux';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { User } from '$app/common/interfaces/user';
import { useUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { useNavigate } from 'react-router-dom';

interface Props {
  entity: string;
  importMap: ImportMap;
  onImport: () => Promise<void> | undefined;
}
export function ImportTemplateModal(props: Props) {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { onImport, importMap, entity } = props;

  const user = useUserChanges();
  const reactSettings = useReactSettings();

  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] =
    useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] =
    useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>('');

  const handleOnClose = () => {
    setTemplateName('');
    setIsSaveTemplateModalOpen(false);
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
        if (currentTemplateName.toLowerCase() === templateName.toLowerCase()) {
          isTemplateDuplicated = true;
        }
      }
    );

    return isTemplateDuplicated;
  };

  const handleSaveTemplate = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      const updatedUser = cloneDeep(user) as User;

      if (updatedUser) {
        set(
          updatedUser,
          `company_user.react_settings.import_templates.${props.entity}.${templateName}`,
          Object.values(importMap.column_map?.[props.entity]?.mapping).map(
            (column) => column || ''
          )
        );

        request(
          'PUT',
          endpoint('/api/v1/company_users/:id', { id: updatedUser.id }),
          updatedUser
        )
          .then((response: GenericSingleResourceResponse<CompanyUser>) => {
            toast.success('updated_settings');

            set(updatedUser, 'company_user', response.data.data);

            $refetch(['company_users']);

            dispatch(updateUser(updatedUser));

            handleOnClose();

            navigate(`/${entity}s`);
          })
          .finally(() => setIsFormBusy(false));
      }
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
              setIsSaveTemplateModalOpen(true);
            }}
          >
            {t('yes')}
          </Button>
        </div>
      </Modal>
    </>
  );
}

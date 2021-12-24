/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { endpoint } from 'common/helpers';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { defaultHeaders } from 'common/queries/common/headers';
import {
  injectInChanges,
  resetChanges,
  updateChanges,
  updateRecord,
} from 'common/stores/slices/company-users';
import { Alert } from 'components/Alert';
import { Divider } from 'components/cards/Divider';
import { ChangeEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, ClickableElement, Element } from '../../../components/cards';
import { InputField } from '../../../components/forms';
import Toggle from '../../../components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';

export function TaskSettings() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const [errors, setErrors] = useState<any>(undefined);

  const company = useCurrentCompany();
  const companyChanges = useCompanyChanges();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('task_settings')}`;

    dispatch(injectInChanges({ object: 'company', data: company }));
  }, [company]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: event.target.id,
        value: event.target.value,
      })
    );

  const handleToggleChange = (id: string, value: boolean) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: id,
        value,
      })
    );

  const onSave = () => {
    toast.loading(t('processing'));
    setErrors(undefined);

    axios
      .put(
        endpoint('/api/v1/companies/:id', { id: companyChanges.id }),
        companyChanges,
        { headers: defaultHeaders }
      )
      .then((response: AxiosResponse) => {
        dispatch(updateRecord({ object: 'company', data: response.data.data }));

        toast.dismiss();
        toast.success(t('updated_settings'));
      })
      .catch((error: AxiosError) => {
        console.error(error);
        toast.dismiss();

        error.response?.status === 422
          ? setErrors(error.response.data)
          : toast.error(t('error_title'));
      });
  };

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={() => dispatch(resetChanges('company'))}
      title={t('task_settings')}
    >
      {errors?.errors?.settings && (
        <Alert type="danger">
          {errors?.errors?.settings.map((element: string) => (
            <p>{element}</p>
          ))}
        </Alert>
      )}

      <Card title={t('settings')}>
        <Element leftSide={t('default_task_rate')}>
          <InputField
            id="settings.default_task_rate"
            onChange={handleChange}
            value={companyChanges?.settings?.default_task_rate || ''}
          />
        </Element>

        <Element
          leftSide={t('auto_start_tasks')}
          leftSideHelp={t('auto_start_tasks_help')}
        >
          <Toggle
            checked={companyChanges?.auto_start_tasks || false}
            onChange={(value: boolean) =>
              handleToggleChange('auto_start_tasks', value)
            }
          />
        </Element>

        <Element
          leftSide={t('show_task_end_date')}
          leftSideHelp={t('show_task_end_date_help')}
        >
          <Toggle
            checked={companyChanges?.show_task_end_date || false}
            onChange={(value: boolean) =>
              handleToggleChange('show_task_end_date', value)
            }
          />
        </Element>

        <Divider />

        <Element
          leftSide={t('show_tasks_table')}
          leftSideHelp={t('show_tasks_table_help')}
        >
          <Toggle
            checked={companyChanges?.show_tasks_table || false}
            onChange={(value: boolean) =>
              handleToggleChange('show_tasks_table', value)
            }
          />
        </Element>

        <Element
          leftSide={t('invoice_task_datelog')}
          leftSideHelp={t('invoice_task_datelog_help')}
        >
          <Toggle
            checked={companyChanges?.invoice_task_datelog || false}
            onChange={(value: boolean) =>
              handleToggleChange('invoice_task_datelog', value)
            }
          />
        </Element>

        <Element
          leftSide={t('invoice_task_timelog')}
          leftSideHelp={t('invoice_task_timelog_help')}
        >
          <Toggle
            checked={companyChanges?.invoice_task_timelog || false}
            onChange={(value: boolean) =>
              handleToggleChange('invoice_task_timelog', value)
            }
          />
        </Element>

        <Element
          leftSide={t('add_documents_to_invoice')}
          leftSideHelp={t('add_documents_to_invoice_help')}
        >
          <Toggle
            checked={companyChanges?.invoice_task_documents || false}
            onChange={(value: boolean) =>
              handleToggleChange('invoice_task_documents', value)
            }
          />
        </Element>
      </Card>

      <Card>
        <ClickableElement to="/settings/task_statuses">
          {t('configure_statuses')}
        </ClickableElement>
      </Card>
    </Settings>
  );
}

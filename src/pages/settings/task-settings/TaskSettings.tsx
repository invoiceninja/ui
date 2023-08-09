/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useTitle } from '$app/common/hooks/useTitle';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { Divider } from '$app/components/cards/Divider';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { TaskStatuses } from '..';
import { Card, Element } from '../../../components/cards';
import { InputField, SelectField } from '../../../components/forms';
import Toggle from '../../../components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../common/atoms';

export function TaskSettings() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('task_settings'), href: '/settings/task_settings' },
  ];

  useTitle('task_settings');
  useInjectCompanyChanges();

  const errors = useAtomValue(companySettingsErrorsAtom);

  const dispatch = useDispatch();
  const companyChanges = useCompanyChanges();

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

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('task_settings')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#task_settings"
      withoutBackButton
    >
      <Card title={t('settings')}>
        <Element leftSide={t('default_task_rate')}>
          <InputField
            id="settings.default_task_rate"
            onChange={handleChange}
            value={companyChanges?.settings?.default_task_rate || ''}
            errorMessage={errors?.errors['settings.default_task_rate']}
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

        <Element
          leftSide={t('show_task_item_description')}
          leftSideHelp={t('show_task_item_description_help')}
        >
          <Toggle
            checked={
              companyChanges?.settings.show_task_item_description || false
            }
            onChange={(value: boolean) =>
              handleToggleChange('settings.show_task_item_description', value)
            }
          />
        </Element>

        <Element
          leftSide={t('allow_billable_task_items')}
          leftSideHelp={t('allow_billable_task_items_help')}
        >
          <Toggle
            checked={
              companyChanges?.settings.allow_billable_task_items || false
            }
            onChange={(value: boolean) =>
              handleToggleChange('settings.allow_billable_task_items', value)
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
          leftSide={t('invoice_task_hours')}
          leftSideHelp={t('invoice_task_hours_help')}
        >
          <Toggle
            checked={companyChanges?.invoice_task_hours || false}
            onChange={(value: boolean) =>
              handleToggleChange('invoice_task_hours', value)
            }
          />
        </Element>

        <Element
          leftSide={t('invoice_task_project')}
          leftSideHelp={t('invoice_task_project_help')}
        >
          <Toggle
            checked={companyChanges?.invoice_task_project || false}
            onChange={(value: boolean) =>
              handleToggleChange('invoice_task_project', value)
            }
          />
        </Element>

        <Element
          leftSide={t('invoice_task_item_description')}
          leftSideHelp={t('invoice_task_item_description_help')}
        >
          <Toggle
            checked={companyChanges?.invoice_task_item_description || false}
            onChange={(value: boolean) =>
              handleToggleChange('invoice_task_item_description', value)
            }
          />
        </Element>

        <Element
          leftSide={t('lock_invoiced_tasks')}
          leftSideHelp={t('lock_invoiced_tasks_help')}
        >
          <Toggle
            checked={companyChanges?.invoice_task_lock || false}
            onChange={(value: boolean) =>
              handleToggleChange('invoice_task_lock', value)
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

        <Divider />

        <Element leftSide={t('show_tasks_in_client_portal')}>
          <Toggle
            checked={companyChanges?.settings?.enable_client_portal_tasks}
            onChange={(value: boolean) =>
              handleToggleChange('settings.enable_client_portal_tasks', value)
            }
          />
        </Element>

        <Element leftSide={t('tasks_shown_in_portal')}>
          <SelectField
            id="settings.show_all_tasks_client_portal"
            onChange={handleChange}
            disabled={
              companyChanges?.settings?.enable_client_portal_tasks
                ? false
                : true
            }
            value={companyChanges?.settings?.show_all_tasks_client_portal.toString()}
            errorMessage={
              errors?.errors['settings.show_all_tasks_client_portal']
            }
          >
            <option value="invoiced">{t('invoiced')}</option>
            <option value="uninvoiced">{t('uninvoiced')}</option>
            <option value="all">{t('all')}</option>
          </SelectField>
        </Element>
      </Card>

      <TaskStatuses />
    </Settings>
  );
}

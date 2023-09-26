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
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { SettingsLabel } from '$app/components/SettingsLabel';

export function TaskSettings() {
  const [t] = useTranslation();

  const disableSettingsField = useDisableSettingsField();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('task_settings'), href: '/settings/task_settings' },
  ];

  useTitle('task_settings');
  useInjectCompanyChanges();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

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
        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="default_task_rate"
              labelElement={<SettingsLabel label={t('default_task_rate')} />}
            />
          }
        >
          <InputField
            type="number"
            id="settings.default_task_rate"
            onChange={handleChange}
            value={companyChanges?.settings?.default_task_rate || ''}
            disabled={disableSettingsField('default_task_rate')}
            errorMessage={errors?.errors['settings.default_task_rate']}
          />
        </Element>

        {isCompanySettingsActive && (
          <Element
            leftSide={t('auto_start_tasks')}
            leftSideHelp={t('auto_start_tasks_help')}
          >
            <Toggle
              checked={Boolean(companyChanges?.auto_start_tasks)}
              onChange={(value: boolean) =>
                handleToggleChange('auto_start_tasks', value)
              }
            />
          </Element>
        )}

        {isCompanySettingsActive && (
          <Element
            leftSide={t('show_task_end_date')}
            leftSideHelp={t('show_task_end_date_help')}
          >
            <Toggle
              checked={Boolean(companyChanges?.show_task_end_date)}
              onChange={(value: boolean) =>
                handleToggleChange('show_task_end_date', value)
              }
            />
          </Element>
        )}

        {isCompanySettingsActive && (
          <Element
            leftSide={t('show_task_item_description')}
            leftSideHelp={t('show_task_item_description_help')}
          >
            <Toggle
              checked={Boolean(
                companyChanges?.settings.show_task_item_description
              )}
              onChange={(value: boolean) =>
                handleToggleChange('settings.show_task_item_description', value)
              }
            />
          </Element>
        )}

        {isCompanySettingsActive && (
          <Element
            leftSide={t('allow_billable_task_items')}
            leftSideHelp={t('allow_billable_task_items_help')}
          >
            <Toggle
              checked={Boolean(
                companyChanges?.settings.allow_billable_task_items
              )}
              onChange={(value: boolean) =>
                handleToggleChange('settings.allow_billable_task_items', value)
              }
            />
          </Element>
        )}

        {isCompanySettingsActive && <Divider />}

        {isCompanySettingsActive && (
          <Element
            leftSide={t('show_tasks_table')}
            leftSideHelp={t('show_tasks_table_help')}
          >
            <Toggle
              checked={Boolean(companyChanges?.show_tasks_table)}
              onChange={(value: boolean) =>
                handleToggleChange('show_tasks_table', value)
              }
            />
          </Element>
        )}

        {isCompanySettingsActive && (
          <Element
            leftSide={t('invoice_task_datelog')}
            leftSideHelp={t('invoice_task_datelog_help')}
          >
            <Toggle
              checked={Boolean(companyChanges?.invoice_task_datelog)}
              onChange={(value: boolean) =>
                handleToggleChange('invoice_task_datelog', value)
              }
            />
          </Element>
        )}

        {isCompanySettingsActive && (
          <Element
            leftSide={t('invoice_task_timelog')}
            leftSideHelp={t('invoice_task_timelog_help')}
          >
            <Toggle
              checked={Boolean(companyChanges?.invoice_task_timelog)}
              onChange={(value: boolean) =>
                handleToggleChange('invoice_task_timelog', value)
              }
            />
          </Element>
        )}

        {isCompanySettingsActive && (
          <Element
            leftSide={t('invoice_task_hours')}
            leftSideHelp={t('invoice_task_hours_help')}
          >
            <Toggle
              checked={Boolean(companyChanges?.invoice_task_hours)}
              onChange={(value: boolean) =>
                handleToggleChange('invoice_task_hours', value)
              }
            />
          </Element>
        )}

        {isCompanySettingsActive && (
          <Element
            leftSide={t('invoice_task_project')}
            leftSideHelp={t('invoice_task_project_help')}
          >
            <Toggle
              checked={Boolean(companyChanges?.invoice_task_project)}
              onChange={(value: boolean) =>
                handleToggleChange('invoice_task_project', value)
              }
            />
          </Element>
        )}

        {isCompanySettingsActive && (
          <Element
            leftSide={t('invoice_task_item_description')}
            leftSideHelp={t('invoice_task_item_description_help')}
          >
            <Toggle
              checked={Boolean(companyChanges?.invoice_task_item_description)}
              onChange={(value: boolean) =>
                handleToggleChange('invoice_task_item_description', value)
              }
            />
          </Element>
        )}

        {isCompanySettingsActive && (
          <Element
            leftSide={t('lock_invoiced_tasks')}
            leftSideHelp={t('lock_invoiced_tasks_help')}
          >
            <Toggle
              checked={Boolean(companyChanges?.invoice_task_lock)}
              onChange={(value: boolean) =>
                handleToggleChange('invoice_task_lock', value)
              }
            />
          </Element>
        )}

        {isCompanySettingsActive && (
          <Element
            leftSide={t('add_documents_to_invoice')}
            leftSideHelp={t('add_documents_to_invoice_help')}
          >
            <Toggle
              checked={Boolean(companyChanges?.invoice_task_documents)}
              onChange={(value: boolean) =>
                handleToggleChange('invoice_task_documents', value)
              }
            />
          </Element>
        )}

        <Divider />

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="enable_client_portal_tasks"
              labelElement={
                <SettingsLabel label={t('show_tasks_in_client_portal')} />
              }
              defaultValue={false}
            />
          }
        >
          <Toggle
            checked={Boolean(
              companyChanges?.settings?.enable_client_portal_tasks
            )}
            onChange={(value: boolean) =>
              handleToggleChange('settings.enable_client_portal_tasks', value)
            }
            disabled={disableSettingsField('enable_client_portal_tasks')}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="show_all_tasks_client_portal"
              labelElement={
                <SettingsLabel label={t('tasks_shown_in_portal')} />
              }
              defaultValue="invoiced"
            />
          }
        >
          <SelectField
            id="settings.show_all_tasks_client_portal"
            onChange={handleChange}
            disabled={
              Boolean(!companyChanges?.settings?.enable_client_portal_tasks) ||
              disableSettingsField('show_all_tasks_client_portal')
            }
            value={
              companyChanges?.settings?.show_all_tasks_client_portal?.toString() ||
              'invoiced'
            }
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

      {isCompanySettingsActive && <TaskStatuses />}
    </Settings>
  );
}

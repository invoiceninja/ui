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
import { SelectField } from '../../../components/forms';
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
import { trans } from '$app/common/helpers';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import { NumberInputField } from '$app/components/forms/NumberInputField';

export function TaskSettings() {
  useTitle('task_settings');
  const [t] = useTranslation();

  useInjectCompanyChanges();
  const dispatch = useDispatch();
  const onCancel = useDiscardChanges();
  const onSave = useHandleCompanySave();
  const disableSettingsField = useDisableSettingsField();
  const handleSettingsChange = useHandleCurrentCompanyChangeProperty();

  const companyChanges = useCompanyChanges();
  const errors = useAtomValue(companySettingsErrorsAtom);
  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('task_settings'), href: '/settings/task_settings' },
  ];

  const isTaskRoundToNearestCustom = () => {
    return Boolean(
      companyChanges?.settings?.task_round_to_nearest === -1 ||
        ![1, 60, 300, 900, 1800, 3600, 86400].find(
          (value) => value === companyChanges?.settings?.task_round_to_nearest
        )
    );
  };

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

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('task_settings')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#task_settings"
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
          <NumberInputField
            value={companyChanges?.settings?.default_task_rate || ''}
            onValueChange={(value) =>
              handleSettingsChange(
                'settings.default_task_rate',
                parseFloat(value)
              )
            }
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

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="task_round_up"
              labelElement={
                <SettingsLabel
                  label={t('round_tasks')}
                  helpLabel={t('round_tasks_help')}
                />
              }
              defaultValue={true}
            />
          }
        >
          <div className="flex items-center space-x-7">
            <Toggle
              checked={Boolean(companyChanges?.settings?.task_round_up ?? true)}
              onChange={(value: boolean) =>
                handleToggleChange('settings.task_round_up', value)
              }
              disabled={disableSettingsField('task_round_up')}
            />
            {companyChanges?.settings.task_round_up ? (
              <span>{t('round_up')}</span>
            ) : (
              <span>{t('round_down')}</span>
            )}
          </div>
        </Element>

        <Element
          leftSideHelp={t('task_round_to_nearest_help')}
          leftSide={
            <PropertyCheckbox
              propertyKey="task_round_to_nearest"
              labelElement={
                <SettingsLabel label={t('task_round_to_nearest')} />
              }
              defaultValue={1}
            />
          }
        >
          <SelectField
            value={
              typeof companyChanges?.settings?.task_round_to_nearest !==
              'undefined'
                ? isTaskRoundToNearestCustom()
                  ? '-1'
                  : companyChanges.settings.task_round_to_nearest.toString()
                : '1'
            }
            onValueChange={(value) =>
              handleSettingsChange(
                'settings.task_round_to_nearest',
                parseFloat(value)
              )
            }
            disabled={disableSettingsField('task_round_to_nearest')}
          >
            <option value="1">
              {t('1_second')} ({t('disabled')})
            </option>
            <option value="60">{t('1_minute')}</option>
            <option value="300">{trans('count_minutes', { count: 5 })}</option>
            <option value="900">{trans('count_minutes', { count: 15 })}</option>
            <option value="1800">
              {trans('count_minutes', { count: 30 })}
            </option>
            <option value="3600">{t('1_hour')}</option>
            <option value="86400">{t('1_day')}</option>
            <option value="-1">{t('custom')}</option>
          </SelectField>
        </Element>

        {isTaskRoundToNearestCustom() && (
          <Element leftSide={t('task_round_to_nearest')}>
            <NumberInputField
              precision={0}
              value={companyChanges?.settings?.task_round_to_nearest || -1}
              onValueChange={(value) =>
                handleSettingsChange(
                  'settings.task_round_to_nearest',
                  parseFloat(value)
                )
              }
              disabled={disableSettingsField('task_round_to_nearest')}
              disablePrecision
            />
          </Element>
        )}
      </Card>

      {isCompanySettingsActive && <TaskStatuses />}
    </Settings>
  );
}

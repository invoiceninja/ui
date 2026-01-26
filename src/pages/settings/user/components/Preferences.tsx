/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Toggle from '$app/components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Element } from '../../../../components/cards';
import { updateChanges } from '$app/common/stores/slices/user';
import {
  preferencesDefaults,
  useReactSettings,
} from '$app/common/hooks/useReactSettings';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { get } from 'lodash';
import { ReactNode } from 'react';
import { StatusColorTheme } from './StatusColorTheme';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { useColorScheme } from '$app/common/colors';
import { Divider } from '$app/components/cards/Divider';
import { CircleXMark } from '$app/components/icons/CircleXMark';

export function Preferences() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const colors = useColorScheme();
  const reactSettings = useReactSettings();

  const handleChange = (property: string, value: string | number | boolean) => {
    dispatch(
      updateChanges({
        property: property,
        value: value,
      })
    );
  };

  return (
    <div className="space-y-4">
      <Element leftSide={t('show_pdf_preview')}>
        <Toggle
          checked={
            typeof reactSettings.show_pdf_preview === 'boolean'
              ? reactSettings.show_pdf_preview
              : true
          }
          onValueChange={(value) =>
            handleChange('company_user.react_settings.show_pdf_preview', value)
          }
        />
      </Element>

      <Element leftSide={t('show_document_preview')}>
        <Toggle
          checked={Boolean(reactSettings.show_document_preview)}
          onValueChange={(value) =>
            handleChange(
              'company_user.react_settings.show_document_preview',
              value
            )
          }
        />
      </Element>

      <Element
        leftSide={t('react_notification_link')}
        leftSideHelp={t('react_notification_link_help')}
      >
        <Toggle
          checked={reactSettings.react_notification_link}
          onValueChange={(value) =>
            handleChange(
              'company_user.react_settings.react_notification_link',
              value
            )
          }
        />
      </Element>

      <Element
        leftSide={t('number_precision')}
        leftSideHelp={t('number_precision_help')}
      >
        <NumberInputField
          precision={0}
          value={reactSettings?.number_precision || ''}
          onValueChange={(value) =>
            handleChange(
              'company_user.react_settings.number_precision',
              Number(value)
            )
          }
          placeholder={t('number_precision')}
          disablePrecision
        />
      </Element>

      <Element leftSide={t('dark_mode')}>
        <Toggle
          checked={Boolean(reactSettings?.dark_mode)}
          onChange={(value) =>
            handleChange('company_user.react_settings.dark_mode', value)
          }
        />
      </Element>

      <Element
        leftSide={t('show_table_footer')}
        leftSideHelp={t('show_table_footer_help')}
      >
        <Toggle
          checked={Boolean(reactSettings?.show_table_footer)}
          onValueChange={(value) =>
            handleChange('company_user.react_settings.show_table_footer', value)
          }
        />
      </Element>

      <Element
        leftSide={t('auto_expand_product_table_notes')}
        leftSideHelp={t('auto_expand_product_table_notes_help')}
      >
        <Toggle
          checked={Boolean(
            reactSettings.preferences.auto_expand_product_table_notes
          )}
          onValueChange={(value) =>
            handleChange(
              'company_user.react_settings.preferences.auto_expand_product_table_notes',
              value
            )
          }
        />
      </Element>

      <Element
        leftSide={t('enable_public_notifications')}
        leftSideHelp={t('enable_public_notifications_help')}
      >
        <Toggle
          checked={Boolean(
            reactSettings.preferences.enable_public_notifications
          )}
          onValueChange={(value) =>
            handleChange(
              'company_user.react_settings.preferences.enable_public_notifications',
              value
            )
          }
        />
      </Element>

      <Element
        leftSide={t('use_system_fonts')}
        leftSideHelp={t('use_system_fonts_help')}
      >
        <Toggle
          checked={Boolean(reactSettings.preferences.use_system_fonts)}
          onValueChange={(value) =>
            handleChange(
              'company_user.react_settings.preferences.use_system_fonts',
              value
            )
          }
        />
      </Element>

      <Element
        leftSide={t('use_legacy_editor')}
        leftSideHelp={t('use_legacy_editor_help')}
      >
        <Toggle
          checked={Boolean(reactSettings.preferences.use_legacy_editor)}
          onValueChange={(value) =>
            handleChange(
              'company_user.react_settings.preferences.use_legacy_editor',
              value
            )
          }
        />
      </Element>

      <StatusColorTheme />

      <PreferenceCard
        title={`${t('dashboard')} ${t('charts')}`}
        path="dashboard_charts"
      >
        <Preference path="dashboard_charts.default_view" />
        <Preference path="dashboard_charts.currency" />
        <Preference path="dashboard_charts.range" />
      </PreferenceCard>

      <PreferenceCard title={t('datatable')} path="datatables">
        <Preference path="datatables.clients.sort" />
      </PreferenceCard>

      <PreferenceCard title={t('reports')} path="reports">
        <Preference path="reports.columns" />
      </PreferenceCard>
    </div>
  );
}

interface PreferenceCardProps {
  title: string;
  children: ReactNode;
  path: string;
}

function PreferenceCard({ title, children, path }: PreferenceCardProps) {
  const colors = useColorScheme();
  const { preferences } = usePreferences();

  if (
    JSON.stringify(get(preferencesDefaults, path)) ===
    JSON.stringify(get(preferences, path))
  ) {
    return null;
  }

  return (
    <>
      <div className="px-4 sm:px-6 pt-4">
        <Divider
          className="border-dashed"
          withoutPadding
          borderColor={colors.$20}
        />
      </div>

      <div className="px-4 sm:px-6">
        <div className="text-lg pt-4 pb-2 font-medium">{title}</div>

        <div>{children}</div>
      </div>
    </>
  );
}

interface PreferenceProps {
  path: string;
}

function Preference({ path }: PreferenceProps) {
  const colors = useColorScheme();
  const { preferences, update } = usePreferences();
  const { t } = useTranslation();

  const translations = {
    'dashboard_charts.default_view': `${t('default')} ${t('view')}`,
    'dashboard_charts.currency': t('currency'),
    'dashboard_charts.range': t('range'),
    'datatables.clients.sort': `${t('clients')} ${t('sort')}`,
    'reports.columns': t('columns'),
  } as const;

  if (get(preferencesDefaults, path) === get(preferences, path)) {
    return null;
  }

  return (
    <div className="flex items-center justify-between w-60 py-3 px-4 sm:px-6">
      <div className="text-sm font-medium">
        {translations[path as keyof typeof translations]}
      </div>

      <div
        className="hover:opacity-75 cursor-pointer"
        onClick={() =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          update(`preferences.${path}`, get(preferencesDefaults, path))
        }
      >
        <CircleXMark
          color={colors.$16}
          hoverColor={colors.$3}
          borderColor={colors.$5}
          hoverBorderColor={colors.$17}
          size="1.6rem"
        />
      </div>
    </div>
  );
}

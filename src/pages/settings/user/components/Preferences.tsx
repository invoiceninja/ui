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
import { Card, ClickableElement, Element } from '../../../../components/cards';
import { updateChanges } from '$app/common/stores/slices/user';
import {
  preferencesDefaults,
  useReactSettings,
} from '$app/common/hooks/useReactSettings';
import { InputField } from '$app/components/forms';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { Inline } from '$app/components/Inline';
import { X } from 'react-feather';
import { get } from 'lodash';
import { ReactNode } from 'react';

export function Preferences() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const reactSettings = useReactSettings();

  const handleChange = (property: string, value: string | boolean) => {
    dispatch(
      updateChanges({
        property: property,
        value: value,
      })
    );
  };

  return (
    <div className="space-y-4">
      <Card title={t('preferences')}>
        <Element leftSide={t('show_pdf_preview')}>
          <Toggle
            checked={
              typeof reactSettings.show_pdf_preview === 'boolean'
                ? reactSettings.show_pdf_preview
                : true
            }
            onValueChange={(value) =>
              handleChange(
                'company_user.react_settings.show_pdf_preview',
                value
              )
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
          <InputField
            value={reactSettings?.number_precision}
            onValueChange={(value) =>
              handleChange(
                'company_user.react_settings.number_precision',
                value
              )
            }
            type="number"
            placeholder={t('number_precision')}
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
              handleChange(
                'company_user.react_settings.show_table_footer',
                value
              )
            }
          />
        </Element>
      </Card>

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
  const { preferences } = usePreferences();

  if (
    JSON.stringify(get(preferencesDefaults, path)) ===
    JSON.stringify(get(preferences, path))
  ) {
    return null;
  }

  return <Card title={title}>{children}</Card>;
}

interface PreferenceProps {
  path: string;
}

function Preference({ path }: PreferenceProps) {
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
    <ClickableElement
      onClick={() =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        update(`preferences.${path}`, get(preferencesDefaults, path))
      }
    >
      <Inline className="space-x-2">
        <div>{translations[path as keyof typeof translations]}</div>

        <X size={18} />
      </Inline>
    </ClickableElement>
  );
}

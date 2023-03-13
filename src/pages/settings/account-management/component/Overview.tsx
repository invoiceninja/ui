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
import { updateChanges } from '$app/common/stores/slices/company-users';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import Toggle from '../../../../components/forms/Toggle';

export function Overview() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const company = useCompanyChanges();

  const handleToggleChange = (id: string, value: boolean) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: id,
        value,
      })
    );

  return (
    <Card title={t('overview')}>
      <Element
        leftSide={t('activate_company')}
        leftSideHelp={t('activate_company_help')}
      >
        <Toggle
          checked={!company?.is_disabled}
          onChange={(value: boolean) =>
            handleToggleChange('is_disabled', !value)
          }
        />
      </Element>

      <Element
        leftSide={t('enable_markdown')}
        leftSideHelp={t('enable_markdown_help')}
      >
        <Toggle
          checked={company?.markdown_enabled}
          onChange={(value: boolean) =>
            handleToggleChange('markdown_enabled', value)
          }
        />
      </Element>

      <Element
        leftSide={t('include_drafts')}
        leftSideHelp={t('include_drafts_help')}
      >
        <Toggle
          checked={company?.report_include_drafts}
          onChange={(value: boolean) =>
            handleToggleChange('report_include_drafts', value)
          }
        />
      </Element>
    </Card>
  );
}

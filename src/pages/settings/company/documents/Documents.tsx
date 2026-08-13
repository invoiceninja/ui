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
import { endpoint } from '$app/common/helpers';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Element } from '$app/components/cards';
import Toggle from '$app/components/forms/Toggle';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { Table as DocumentsTable, Upload } from './components';

export function Documents() {
  const [t] = useTranslation();

  const onSuccess = () => {
    $refetch(['documents']);
  };

  const company = useCurrentCompany();
  const companyChanges = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  return (
    <>
      <Element
        leftSide={t('documents_public_by_default')}
        leftSideHelp={t('documents_public_by_default_help')}
      >
        <Toggle
          checked={
            companyChanges?.settings?.documents_public_by_default ?? true
          }
          onChange={(value: boolean) =>
            handleChange('settings.documents_public_by_default', value)
          }
          cypressRef="documentsPublicByDefaultToggle"
        />
      </Element>

      <div className="px-6 pt-3">
        {company && (
          <Upload
            endpoint={endpoint('/api/v1/companies/:id/upload', {
              id: company.id,
            })}
            onSuccess={onSuccess}
            widgetOnly
          />
        )}
        <DocumentsTable />
      </div>
    </>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { InputField, Link } from '$app/components/forms';
import { DesignSelector } from '$app/common/generic/DesignSelector';
import { endpoint } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import Toggle from '$app/components/forms/Toggle';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { TabGroup } from '$app/components/TabGroup';
import { UserSelector } from '$app/components/users/UserSelector';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import { useAtom } from 'jotai';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';
import { quoteAtom } from '../atoms';
import { ChangeHandler } from '../hooks';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

interface Props {
  handleChange: ChangeHandler;
  errors: ValidationBag | undefined;
}

export function QuoteFooter(props: Props) {
  const { t } = useTranslation();
  const { id } = useParams();
  const { handleChange, errors } = props;

  const location = useLocation();
  const queryClient = useQueryClient();

  const [quote] = useAtom(quoteAtom);

  const tabs = [
    t('terms'),
    t('footer'),
    t('public_notes'),
    t('private_notes'),
    t('documents'),
    t('settings'),
    t('custom_fields'),
  ];

  const onSuccess = () => {
    queryClient.invalidateQueries(route('/api/v1/quotes/:id', { id }));
  };

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup tabs={tabs}>
        <div>
          <MarkdownEditor
            value={quote?.terms || ''}
            onChange={(value) => handleChange('terms', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={quote?.footer || ''}
            onChange={(value) => handleChange('footer', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={quote?.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={quote?.private_notes || ''}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>

        {location.pathname.endsWith('/create') ? (
          <div className="text-sm">{t('save_to_upload_documents')}.</div>
        ) : (
          <div>
            <Upload
              widgetOnly
              endpoint={endpoint('/api/v1/quotes/:id/upload', {
                id,
              })}
              onSuccess={onSuccess}
            />

            <DocumentsTable
              documents={quote?.documents || []}
              onDocumentDelete={onSuccess}
            />
          </div>
        )}

        <div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <UserSelector
                  inputLabel={t('user')}
                  value={quote?.assigned_user_id}
                  onChange={(user) => handleChange('assigned_user_id', user.id)}
                  errorMessage={errors?.errors.assigned_user_id}
                />
              </div>

              <div className="space-y-2">
                <VendorSelector
                  inputLabel={t('vendor')}
                  value={quote?.vendor_id}
                  onChange={(vendor) => handleChange('vendor_id', vendor.id)}
                  onClearButtonClick={() => handleChange('vendor_id', '')}
                  errorMessage={errors?.errors.vendor_id}
                />
              </div>

              <div className="space-y-2">
                <DesignSelector
                  inputLabel={t('design')}
                  value={quote?.design_id}
                  onChange={(design) => handleChange('design_id', design.id)}
                  onClearButtonClick={() => handleChange('design_id', '')}
                  disableWithQueryParameter
                  errorMessage={errors?.errors.design_id}
                />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <ProjectSelector
                  inputLabel={t('project')}
                  value={quote?.project_id}
                  onChange={(project) => handleChange('project_id', project.id)}
                  errorMessage={errors?.errors.project_id}
                />
              </div>

              <div className="space-y-2">
                <InputField
                  label={t('exchange_rate')}
                  value={quote?.exchange_rate || '1.00'}
                  onValueChange={(value) =>
                    handleChange('exchange_rate', parseFloat(value))
                  }
                  errorMessage={errors?.errors.exchange_rate}
                />
              </div>

              <div className="pt-9">
                <Toggle
                  label={t('inclusive_taxes')}
                  checked={quote?.uses_inclusive_taxes || false}
                  onChange={(value) =>
                    handleChange('uses_inclusive_taxes', value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <span className="text-sm">
            {t('custom_fields_location_changed')} &nbsp;
          </span>
          <Link to="/settings/custom_fields/quotes" className="capitalize">
            {t('click_here')}
          </Link>
        </div>
      </TabGroup>
    </Card>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { route } from '$app/common/helpers/route';
import { useBlueprintQuery } from '$app/common/queries/docuninja/blueprints';
import { Page } from '$app/components/Breadcrumbs';
import { Card, Element } from '$app/components/cards';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useActions } from '../common/hooks/useActions';
import { EditBlueprintModal } from './components/EditBlueprintModal';

export default function Edit() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const { data: blueprintResponse, isLoading } = useBlueprintQuery({ id });

  const actions = useActions({
    onSettingsClick: () => {
      setIsEditModalOpen(true);
    },
  });

  const pages: Page[] = [
    { name: t('docuninja'), href: '/docuninja' },
    {
      name: t('templates'),
      href: route('/docuninja/templates'),
    },
    {
      name: t('edit_template'),
      href: route('/docuninja/templates/:id/edit', { id }),
    },
  ];

  return (
    <Default
      title={t('edit_template')}
      breadcrumbs={pages}
      navigationTopRight={
        <ResourceActions
          resource={blueprintResponse?.data?.data}
          actions={actions}
        />
      }
    >
      <div className="flex justify-center">
        <Card
          title={isLoading ? t('loading') : t('template_details')}
          className="shadow-sm w-full xl:w-1/2"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              <Element leftSide={t('name')}>
                <div className="text-sm text-gray-600">
                  {blueprintResponse?.data.data.name}
                </div>
              </Element>
              <Element leftSide={t('description')}>
                <div className="text-sm text-gray-600">
                  {blueprintResponse?.data.data.description ||
                    t('no_description')}
                </div>
              </Element>
              <Element leftSide={t('created_at')}>
                <div className="text-sm text-gray-600">
                  {blueprintResponse?.data.data.created_at
                    ? new Date(
                        blueprintResponse?.data.data.created_at
                      ).toLocaleDateString()
                    : '-'}
                </div>
              </Element>
              <Element leftSide={t('updated_at')}>
                <div className="text-sm text-gray-600">
                  {blueprintResponse?.data.data.updated_at
                    ? new Date(
                        blueprintResponse?.data.data.updated_at
                      ).toLocaleDateString()
                    : '-'}
                </div>
              </Element>
            </div>
          )}
        </Card>
      </div>

      {blueprintResponse && (
        <EditBlueprintModal
          blueprint={blueprintResponse.data.data}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </Default>
  );
}

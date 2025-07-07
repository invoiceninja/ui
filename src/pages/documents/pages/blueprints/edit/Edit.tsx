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
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlueprintQuery } from '$app/common/queries/docuninja/blueprints';
import { Page } from '$app/components/Breadcrumbs';
import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

export default function Edit() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { id } = useParams();
  const colors = useColorScheme();

  const { data: blueprintResponse, isLoading } = useBlueprintQuery({ id });

  const pages: Page[] = [
    { name: t('documents'), href: '/documents' },
    {
      name: t('blueprints'),
      href: route('/documents/blueprints'),
    },
    {
      name: t('edit_blueprint'),
      href: route('/documents/blueprints/:id/edit', { id }),
    },
  ];

  const [blueprint, setBlueprint] = useState<Blueprint>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | undefined>(undefined);

  const handleEdit = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request(
        'PUT',
        docuNinjaEndpoint('/api/blueprints/:id', { id }),
        blueprint,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then((response: GenericSingleResourceResponse<Blueprint>) => {
          toast.success('updated_blueprint');

          $refetch(['blueprints']);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (blueprintResponse) {
      setBlueprint(blueprintResponse.data.data);
    }
  }, [blueprintResponse]);

  return (
    <Default
      title={t('edit_blueprint')}
      breadcrumbs={pages}
      onSaveClick={handleEdit}
      disableSaveButton={isFormBusy || !blueprint}
    >
      <div className="flex justify-center">
        <Card
          title={isLoading ? t('loading') : t('edit_blueprint')}
          className="shadow-sm w-full xl:w-1/2"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <Element leftSide={t('name')}>
              <InputField
                value={blueprint?.name}
                onValueChange={(value) =>
                  setBlueprint(
                    (blueprint) =>
                      blueprint && {
                        ...blueprint,
                        name: value,
                      }
                  )
                }
                errorMessage={errors?.errors.name}
              />
            </Element>
          )}
        </Card>
      </div>
    </Default>
  );
}

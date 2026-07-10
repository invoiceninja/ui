/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useTitle } from '$app/common/hooks/useTitle';
import {
  resolveTagEntityType,
  TAG_ENTITY_TYPE_OPTIONS,
  Tag,
} from '$app/common/interfaces/tag';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTagQuery } from '$app/common/queries/tags';
import { Badge } from '$app/components/Badge';
import { Card, CardContainer, Element } from '$app/components/cards';
import { InputField, InputLabel, SelectField } from '$app/components/forms';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { Settings } from '$app/components/layouts/Settings';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { useActions, useHandleChange } from './common/hooks';

interface Props {
  editRoute: string;
}

function Edit(props: Props) {
  const [t] = useTranslation();

  const { id } = useParams();

  const actions = useActions();
  const colors = useColorScheme();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('tags'), href: '/settings/tags' },
    {
      name: t('edit_tag'),
      href: route(props.editRoute, { id }),
    },
  ];

  const { data: tagData } = useTagQuery({ id });

  const [errors, setErrors] = useState<ValidationBag>();
  const { documentTitle, setDocumentTitle } = useTitle('');
  const [tag, setTag] = useState<Tag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isTitleApplied, setIsTitleApplied] = useState<boolean>(false);

  const handleChange = useHandleChange({ setErrors, setTag });

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);
      setIsFormBusy(true);

      request('PUT', endpoint('/api/v1/tags/:id', { id }), tag)
        .then(() => {
          toast.success('updated_tag');

          $refetch(['tags']);

          setIsTitleApplied(false);
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
    if (tagData) {
      setTag(tagData.data.data);
    }
  }, [tagData]);

  useEffect(() => {
    if (tag && !isTitleApplied) {
      setDocumentTitle(tag.name);
      setIsTitleApplied(true);
    }
  }, [tag]);

  return (
    <Settings
      title={t('tags')}
      navigationTopRight={
        tag && (
          <ResourceActions
            label={t('actions')}
            resource={tag}
            actions={actions}
          />
        )
      }
      breadcrumbs={pages}
    >
      {!tag && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {tag && (
        <Card
          title={documentTitle}
          className="shadow-sm"
          childrenClassName="pt-4"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
          withoutBodyPadding
          withSaveButton
          disableSubmitButton={isFormBusy}
          onSaveClick={(event) => handleSave(event)}
          onFormSubmit={(event) => handleSave(event)}
        >
          <Element leftSide={t('status')}>
            {!tag.is_deleted && !tag.archived_at && (
              <Badge variant="primary">{t('active')}</Badge>
            )}

            {tag.archived_at && !tag.is_deleted ? (
              <Badge variant="yellow">{t('archived')}</Badge>
            ) : null}

            {tag.is_deleted && <Badge variant="red">{t('deleted')}</Badge>}
          </Element>

          <CardContainer>
            <InputField
              id="name"
              required
              label={t('name')}
              value={tag.name}
              onValueChange={(value) => handleChange('name', value)}
              errorMessage={errors?.errors?.name}
            />

            <SelectField
              id="entity_type"
              label={t('type')}
              value={resolveTagEntityType(tag.entity_type)}
              disabled
            >
              {TAG_ENTITY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </SelectField>

            <div>
              <InputLabel className="mb-1">{t('color')}</InputLabel>

              <ColorPicker
                value={tag.color || ''}
                onValueChange={(value) => handleChange('color', value)}
              />
            </div>
          </CardContainer>
        </Card>
      )}
    </Settings>
  );
}

export function EditTag() {
  return <Edit editRoute="/settings/tags/:id/edit" />;
}

export function EditTaskTag() {
  return <Edit editRoute="/settings/tags/tasks/:id/edit" />;
}

export function EditProjectTag() {
  return <Edit editRoute="/settings/tags/projects/:id/edit" />;
}

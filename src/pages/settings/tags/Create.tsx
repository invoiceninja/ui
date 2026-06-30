/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ButtonOption, Card, CardContainer } from '$app/components/cards';
import { InputField, InputLabel, SelectField } from '$app/components/forms';
import { AxiosError } from 'axios';
import {
  TAG_ENTITY_TYPES,
  TAG_ENTITY_TYPE_OPTIONS,
  Tag,
  TagEntityType,
} from '$app/common/interfaces/tag';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { randomTagColor } from '$app/common/helpers/tags';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useTitle } from '$app/common/hooks/useTitle';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankTagQuery } from '$app/common/queries/tags';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { Icon } from '$app/components/icons/Icon';
import { Settings } from '$app/components/layouts/Settings';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiPlusCircle } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { useHandleChange } from './common/hooks';
import { useColorScheme } from '$app/common/colors';

interface Props {
  initialEntityType?: TagEntityType;
}

function Create(props: Props) {
  const { documentTitle } = useTitle('new_tag');

  const [t] = useTranslation();
  const navigate = useNavigate();
  const colors = useColorScheme();
  const accentColor = useAccentColor();
  const initialEntityType = props.initialEntityType ?? TAG_ENTITY_TYPES.global;

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('tags'), href: '/settings/tags' },
    { name: t('new_tag'), href: '/settings/tags/create' },
  ];

  const { data: blankTag } = useBlankTagQuery(initialEntityType);

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [tag, setTag] = useState<Tag>();

  const handleChange = useHandleChange({
    setErrors,
    setTag,
  });

  const resetTag = () => {
    if (blankTag) {
      setTag({
        ...blankTag,
        entity_type: initialEntityType,
        color: randomTagColor(),
      });
    }
  };

  const handleSave = (
    event: FormEvent<HTMLFormElement>,
    actionType: string
  ) => {
    event.preventDefault();

    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);
      setIsFormBusy(true);

      const payload = tag
        ? { ...tag, entity_type: tag.entity_type || TAG_ENTITY_TYPES.global }
        : tag;

      request('POST', endpoint('/api/v1/tags'), payload)
        .then((response) => {
          toast.success('created_tag');

          $refetch(['tags']);

          if (actionType === 'save') {
            navigate(
              route('/settings/tags/:id/edit', {
                id: response.data.data.id,
              })
            );
          } else {
            resetTag();
          }
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
    resetTag();
  }, [blankTag, initialEntityType]);

  const saveOptions: ButtonOption[] = [
    {
      onClick: (event: FormEvent<HTMLFormElement>) =>
        handleSave(event, 'create'),
      text: t('save') + ' / ' + t('create'),
      icon: <Icon element={BiPlusCircle} />,
    },
  ];

  return (
    <Settings title={t('tags')} breadcrumbs={pages}>
      <Card
        title={documentTitle}
        className="shadow-sm"
        childrenClassName="pt-4"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
        withoutBodyPadding
        withSaveButton
        disableSubmitButton={isFormBusy}
        onSaveClick={(event) => handleSave(event, 'save')}
        additionalSaveOptions={saveOptions}
      >
        <CardContainer>
          <InputField
            id="name"
            required
            label={t('name')}
            value={tag?.name}
            onValueChange={(value) => handleChange('name', value)}
            errorMessage={errors?.errors.name}
          />

          <SelectField
            id="entity_type"
            required
            label={t('type')}
            value={tag?.entity_type || TAG_ENTITY_TYPES.global}
            onValueChange={(value) =>
              handleChange('entity_type', value as TagEntityType)
            }
            errorMessage={errors?.errors.entity_type}
            customSelector
            dismissable={false}
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
              value={tag?.color || accentColor}
              onValueChange={(color) => handleChange('color', color)}
            />
          </div>
        </CardContainer>
      </Card>
    </Settings>
  );
}

export function CreateTag() {
  return <Create />;
}

export function CreateTaskTag() {
  return <Create initialEntityType={TAG_ENTITY_TYPES.task} />;
}

export function CreateProjectTag() {
  return <Create initialEntityType={TAG_ENTITY_TYPES.project} />;
}

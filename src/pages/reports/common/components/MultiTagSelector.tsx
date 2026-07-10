/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiValue } from 'react-select';
import { useColorScheme } from '$app/common/colors';
import { TagEntityType } from '$app/common/interfaces/tag';
import { useTagsQuery } from '$app/common/queries/tags';
import { Element } from '$app/components/cards';
import { SelectOption } from '$app/components/datatables/Actions';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { CustomMultiSelect } from '$app/components/forms/CustomMultiSelect';
import { Spinner } from '$app/components/Spinner';
import { isActiveTag } from '$app/components/tags/TagPills';

interface Props {
  entityType: TagEntityType;
  value?: string;
  onValueChange: (tagIds: string) => void;
  errorMessage?: string[] | string;
}

export function MultiTagSelector(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const { entityType, errorMessage, onValueChange, value } = props;

  const { data: tagsResponse } = useTagsQuery({ entityType });

  const tags = useMemo<SelectOption[] | undefined>(
    () =>
      tagsResponse?.data.filter(isActiveTag).map((tag) => ({
        value: tag.id,
        label: tag.name,
        color: colors.$3,
        backgroundColor: colors.$1,
      })),
    [colors.$1, colors.$3, tagsResponse]
  );

  const handleChange = (tags: MultiValue<{ value: string; label: string }>) => {
    return (tags as SelectOption[])
      .map((option: { value: string; label: string }) => option.value)
      .join(',');
  };

  return (
    <>
      {tags ? (
        <Element leftSide={t('tags')}>
          <CustomMultiSelect
            id="tagItemSelector"
            {...(value && {
              value: tags.filter((option) =>
                value.split(',').find((tagId) => tagId === option.value)
              ),
            })}
            onValueChange={(options) => onValueChange(handleChange(options))}
            options={tags}
            isSearchable={true}
          />
        </Element>
      ) : (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      )}

      <ErrorMessage className="mt-2">{errorMessage}</ErrorMessage>
    </>
  );
}

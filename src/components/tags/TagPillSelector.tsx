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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { randomTagColor } from '$app/common/helpers/tags';
import { toast } from '$app/common/helpers/toast/toast';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { $refetch } from '$app/common/hooks/useRefetch';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Tag, TagEntityType } from '$app/common/interfaces/tag';
import { useTagsQuery } from '$app/common/queries/tags';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { InputLabel } from '$app/components/forms';
import { Plus } from '$app/components/icons/Plus';
import { XMark } from '$app/components/icons/XMark';
import {
  isActiveTag,
  tagPillBackgroundColor,
  tagPillColor,
} from '$app/components/tags/TagPills';
import { AxiosError } from 'axios';
import classNames from 'classnames';
import { ChangeEvent, ReactNode, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClickAway } from 'react-use';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

interface Props {
  entityType: TagEntityType;
  value?: Tag[];
  onChange: (tags: Tag[]) => void;
  label?: ReactNode;
  errorMessage?: string | string[];
  readonly?: boolean;
  className?: string;
}

export function TagPillSelector(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const { isAdmin } = useAdmin();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch } = useTagsQuery({
    entityType: props.entityType,
  });

  const selectedTags = props.value || [];
  const selectedIds = useMemo(
    () => selectedTags.map((tag) => tag.id),
    [selectedTags]
  );

  const activeTags = useMemo(
    () => (data?.data || []).filter(isActiveTag),
    [data]
  );
  const normalizedQuery = query.trim().toLowerCase();
  const tagName = query.trim();

  const hasExactMatch = useMemo(
    () =>
      activeTags.some(
        (tag) => tag.name.trim().toLowerCase() === normalizedQuery
      ),
    [activeTags, normalizedQuery]
  );

  const canCreateTag =
    isAdmin && Boolean(tagName) && !hasExactMatch && !isCreating && !isLoading;

  const availableTags = useMemo(() => {
    return activeTags
      .filter((tag) => !selectedIds.includes(tag.id))
      .filter((tag) => tag.name.toLowerCase().includes(query.toLowerCase()));
  }, [activeTags, query, selectedIds]);

  useClickAway(containerRef, () => setIsOpen(false));

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setIsOpen(true);
  };

  const addTag = (tag: Tag) => {
    props.onChange([...selectedTags, tag]);
    setQuery('');
    setIsOpen(false);
  };

  const removeTag = (tag: Tag) => {
    props.onChange(selectedTags.filter((selected) => selected.id !== tag.id));
  };

  const createTag = () => {
    if (!canCreateTag) {
      return;
    }

    toast.processing();
    setIsCreating(true);

    request('POST', endpoint('/api/v1/tags'), {
      entity_type: props.entityType,
      name: tagName,
      color: randomTagColor(),
    })
      .then((response: GenericSingleResourceResponse<Tag>) => {
        toast.success('created_tag');

        props.onChange([...selectedTags, response.data.data]);
        setQuery('');
        setIsOpen(false);

        refetch();
        $refetch(['tags']);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
        }
      })
      .finally(() => setIsCreating(false));
  };

  return (
    <div ref={containerRef} className={classNames('w-full', props.className)}>
      {props.label && <InputLabel className="mb-1">{props.label}</InputLabel>}

      <div
        className={classNames(
          'relative min-h-[2.375rem] w-full rounded-md border px-2 py-1.5 text-sm',
          {
            'opacity-75': props.readonly,
          }
        )}
        style={{ backgroundColor: colors.$1, borderColor: colors.$20 }}
      >
        <div className="flex min-h-[1.5rem] flex-wrap items-center gap-1.5">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex h-6 max-w-full items-center gap-1 rounded-full border px-2 text-xs font-medium"
              style={{
                backgroundColor: tagPillBackgroundColor(tag),
                borderColor: tagPillColor(tag),
                color: colors.$3,
              }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: tagPillColor(tag) }}
              />

              <span className="truncate">{tag.name}</span>

              {!props.readonly && (
                <button
                  type="button"
                  className="ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full focus:outline-none"
                  onClick={() => removeTag(tag)}
                  aria-label={String(t('delete'))}
                >
                  <XMark size="0.55rem" color={colors.$3} />
                </button>
              )}
            </span>
          ))}

          {!props.readonly && (
            <input
              data-cy="tagSelectorInput"
              className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
              style={{ color: colors.$3 }}
              value={query}
              placeholder={selectedTags.length ? '' : String(t('search'))}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
            />
          )}
        </div>

        {isOpen && !props.readonly && (
          <div
            className="absolute left-0 right-0 z-20 mt-2 max-h-56 overflow-y-auto rounded-md border p-1 shadow-2xl"
            style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
          >
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                data-cy="tagOption"
                type="button"
                className="flex w-full items-center gap-2 rounded-[0.1875rem] px-3 py-2 text-left text-sm"
                style={{ color: colors.$3 }}
                onClick={() => addTag(tag)}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: tagPillColor(tag) }}
                />

                <span className="truncate">{tag.name}</span>
              </button>
            ))}

            {canCreateTag && (
              <button
                data-cy="createTagOption"
                type="button"
                className="flex w-full items-center gap-2 rounded-[0.1875rem] px-3 py-2 text-left text-sm font-medium"
                style={{ color: colors.$3 }}
                onClick={createTag}
              >
                <Plus size="0.85rem" color={colors.$16} />

                <span>
                  {t('create')} <q>{tagName}</q>
                </span>
              </button>
            )}

            {!availableTags.length && !canCreateTag && (
              <div
                className="px-3 py-2 text-sm font-medium"
                style={{ color: colors.$17 }}
              >
                {t('no_records_found')}.
              </div>
            )}
          </div>
        )}
      </div>

      <ErrorMessage className="mt-2">{props.errorMessage}</ErrorMessage>
    </div>
  );
}

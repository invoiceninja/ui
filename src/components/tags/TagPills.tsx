/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { useColorScheme } from '$app/common/colors';
import { Tag } from '$app/common/interfaces/tag';

interface Props {
  tags?: Tag[];
  className?: string;
}

export function isActiveTag(tag: Tag) {
  return !tag.is_deleted && !tag.archived_at;
}

export function tagPillColor(tag: Tag) {
  return tag.color || '#64748b';
}

export function tagPillBackgroundColor(tag: Tag) {
  const color = tagPillColor(tag);

  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}1f`;
  }

  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return `${color}1f`;
  }

  return 'transparent';
}

export function TagPills(props: Props) {
  const colors = useColorScheme();
  const tags = props.tags || [];

  if (!tags.length) {
    return null;
  }

  return (
    <div
      className={classNames('flex max-w-xs flex-wrap gap-1', props.className)}
    >
      {tags.map((tag) => (
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
        </span>
      ))}
    </div>
  );
}

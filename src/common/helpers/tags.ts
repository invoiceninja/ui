/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tag } from '$app/common/interfaces/tag';

type TagValue = Tag | string;

interface TaggableEntity {
  tags?: TagValue[];
}

export function randomTagColor() {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;
}

export function tagIds(tags: TagValue[] = []) {
  return tags.map((tag) => (typeof tag === 'string' ? tag : tag.id));
}

export function serializeTagsPayload<T extends TaggableEntity>(entity: T) {
  if (!Array.isArray(entity.tags)) {
    return entity;
  }

  return {
    ...entity,
    tags: tagIds(entity.tags),
  };
}

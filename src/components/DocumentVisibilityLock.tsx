/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { Document } from '$app/common/interfaces/document.interface';
import { useSetDocumentVisibility } from '$app/common/queries/documents';
import { Lock } from './icons/Lock';
import { LockOpen } from './icons/LockOpen';
import { Tooltip } from './Tooltip';

interface Props {
  document: Document;
  onVisibilityChange?: () => unknown;
  disabled?: boolean;
}

export function DocumentVisibilityLock(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const setDocumentVisibility = useSetDocumentVisibility();

  const { document, onVisibilityChange, disabled } = props;

  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const LockIcon = document.is_public ? LockOpen : Lock;
  const label = t(document.is_public ? 'set_private' : 'set_public') as string;

  const handleClick = () => {
    if (isUpdating) {
      return;
    }

    setIsUpdating(true);

    setDocumentVisibility(document.id, !document.is_public)
      .then(() => onVisibilityChange?.())
      .finally(() => setIsUpdating(false));
  };

  if (disabled) {
    return <LockIcon color={colors.$3} size="1.4rem" />;
  }

  return (
    <Tooltip
      message={label}
      placement="top"
      width="auto"
      withoutArrow
      appendToBody
    >
      <button
        type="button"
        className="flex items-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleClick}
        disabled={isUpdating}
      >
        <LockIcon color={colors.$3} size="1.4rem" />
      </button>
    </Tooltip>
  );
}

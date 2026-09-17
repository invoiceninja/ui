/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';

interface Props {
  label: string;
  checked: boolean;
  allowed: boolean;
  requirement: string;
  busy: boolean;
  onChange: (value: boolean) => void;
  onUpgrade: () => void;
}

export function AttachmentOption({
  label,
  checked,
  allowed,
  requirement,
  busy,
  onChange,
  onUpgrade,
}: Props) {
  const [t] = useTranslation();

  return (
    <Element
      leftSide={label}
      leftSideHelp={allowed ? t('saved_for_all_future_emails') : requirement}
      pushContentToRight
      noExternalPadding
      twoGridColumns
    >
      <div className="flex items-center justify-end gap-3">
        {allowed ? null : (
          <Button type="secondary" behavior="button" onClick={onUpgrade}>
            {t('upgrade')}
          </Button>
        )}

        <Toggle
          checked={checked}
          disabled={!allowed || busy}
          onValueChange={(value) => onChange(value)}
        />
      </div>
    </Element>
  );
}

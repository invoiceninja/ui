/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ErrorMessage } from './ErrorMessage';
import { InputLabel } from './forms';
import { Icon } from './icons/Icon';

interface AttachmentProps {
  file: File;
  onRemove: () => unknown;
}

function Attachment(props: AttachmentProps) {
  const colors = useColorScheme();

  const { file, onRemove } = props;

  const [url, setUrl] = useState<string>();

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);

    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative">
      <img
        src={url}
        alt={file.name}
        title={file.name}
        className="h-16 w-16 rounded-md border object-cover"
        style={{ borderColor: colors.$24 }}
      />

      <button
        type="button"
        className="absolute -top-2 -right-2 rounded-full border p-0.5"
        style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
        onClick={onRemove}
      >
        <Icon element={MdClose} size={14} color={colors.$3} />
      </button>
    </div>
  );
}

interface Props {
  attachments: File[];
  errors: ValidationBag | undefined;
  onRemove: (index: number) => unknown;
}

export function SupportAttachments(props: Props) {
  const [t] = useTranslation();

  const { attachments, errors, onRemove } = props;

  const messages = Object.entries(errors?.errors ?? {})
    .filter(([key]) => key.startsWith('attachments'))
    .flatMap(([, value]) => value);

  if (!attachments.length && !messages.length) {
    return null;
  }

  return (
    <div>
      <InputLabel className="mb-1">{t('attachments')}</InputLabel>

      <div className="flex flex-wrap gap-3 pt-2">
        {attachments.map((attachment, index) => (
          <Attachment
            key={index}
            file={attachment}
            onRemove={() => onRemove(index)}
          />
        ))}
      </div>

      {messages.map((message, index) => (
        <ErrorMessage key={index} className="mt-2">
          {message}
        </ErrorMessage>
      ))}
    </div>
  );
}

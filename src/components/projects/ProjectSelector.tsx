/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GenericSelectorProps } from 'common/interfaces/generic-selector-props';
import { Project } from 'common/interfaces/project';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function ProjectSelector(props: GenericSelectorProps<Project>) {
  const [t] = useTranslation();
  const [, setIsModalOpen] = useState(false);

  return (
    <DebouncedCombobox
      inputLabel={props.inputLabel}
      endpoint="/api/v1/projects"
      label="name"
      onChange={(value: Record<Project>) =>
        value.resource && props.onChange(value.resource)
      }
      defaultValue={props.value}
      disabled={props.readonly}
      clearButton={props.clearButton}
      onClearButtonClick={props.onClearButtonClick}
      queryAdditional
      actionLabel={t('new_project')}
      onActionClick={() => setIsModalOpen(true)}
    />
  );
}

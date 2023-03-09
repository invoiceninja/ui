/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GenericSelectorProps } from '$app/common/interfaces/generic-selector-props';
import { Project } from '$app/common/interfaces/project';
import { DebouncedCombobox, Record } from '$app/components/forms/DebouncedCombobox';
import { CreateProjectModal } from '$app/pages/projects/common/components/CreateProjectModal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function ProjectSelector(props: GenericSelectorProps<Project>) {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <CreateProjectModal
        visible={isModalOpen}
        setVisible={setIsModalOpen}
        onProjectCreated={(project) => props.onChange(project)}
      />

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
        errorMessage={props.errorMessage}
      />
    </>
  );
}

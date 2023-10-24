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

import { CreateProjectModal } from '$app/pages/projects/common/components/CreateProjectModal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboboxAsync } from '../forms/Combobox';
import { endpoint } from '$app/common/helpers';
import { Alert } from '../Alert';

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

      <ComboboxAsync<Project>
        inputOptions={{
          label: props.inputLabel?.toString(),
          value: props.value ?? null,
        }}
        endpoint={endpoint('/api/v1/projects?status=active')}
        entryOptions={{ id: 'id', label: 'name', value: 'id' }}
        onChange={(entry) =>
          entry.resource ? props.onChange(entry.resource) : null
        }
        readonly={props.readonly}
        onDismiss={props.onClearButtonClick}
        action={{
          label: t('new_project'),
          onClick: () => setIsModalOpen(true),
          visible: true,
        }}
      />

      {props.errorMessage ? (
        <Alert className="mt-2" type="danger">
          {props.errorMessage}
        </Alert>
      ) : null}
    </>
  );
}

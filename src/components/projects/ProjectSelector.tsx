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
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { ErrorMessage } from '../ErrorMessage';

interface Props extends GenericSelectorProps<Project> {
  clientId?: string;
}

export function ProjectSelector(props: Props) {
  const [t] = useTranslation();
  const hasPermission = useHasPermission();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const clientIdParam = props.clientId ? `&client_id=${props.clientId}` : '';

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
        endpoint={endpoint(
          `/api/v1/projects?status=active&filter_deleted_clients=true${clientIdParam}`
        )}
        entryOptions={{ id: 'id', label: 'name', value: 'id' }}
        onChange={(entry) =>
          entry.resource ? props.onChange(entry.resource) : null
        }
        readonly={props.readonly}
        onDismiss={props.onClearButtonClick}
        action={{
          label: t('new_project'),
          onClick: () => setIsModalOpen(true),
          visible: hasPermission('create_project'),
        }}
      />

      <ErrorMessage className="mt-2">{props.errorMessage}</ErrorMessage>
    </>
  );
}

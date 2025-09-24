/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Spinner } from '$app/components/Spinner';
import { Element } from '$app/components/cards';
import { SelectOption } from '$app/components/datatables/Actions';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiValue } from 'react-select';
import { useColorScheme } from '$app/common/colors';
import { useProjectsQuery } from '$app/common/queries/projects';
import { useSelectorCustomStyles } from '../hooks/useSelectorCustomStyles';
import { CustomMultiSelect } from '$app/components/forms/CustomMultiSelect';
import { ErrorMessage } from '$app/components/ErrorMessage';

interface Props {
  value?: string;
  onValueChange: (projectIds: string) => void;
  errorMessage?: string[] | string;
}
export function MultiProjectSelector(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const { customStyles } = useSelectorCustomStyles();

  const { value, onValueChange, errorMessage } = props;

  const [projects, setProjects] = useState<SelectOption[]>();

  const { data: projectsResponse } = useProjectsQuery({ status: ['active'] });

  useEffect(() => {
    if (projectsResponse) {
      setProjects(
        projectsResponse.map((project) => ({
          value: project.id,
          label: project.name,
          color: colors.$3,
          backgroundColor: colors.$1,
        }))
      );
    }
  }, [projectsResponse]);

  const handleChange = (
    projects: MultiValue<{ value: string; label: string }>
  ) => {
    return (projects as SelectOption[])
      .map((option: { value: string; label: string }) => option.value)
      .join(',');
  };

  return (
    <>
      {projects ? (
        <Element leftSide={t('projects')}>
          <CustomMultiSelect
            id="projectItemSelector"
            {...(value && {
              value: projects?.filter((option) =>
                value.split(',').find((projectId) => projectId === option.value)
              ),
            })}
            onValueChange={(options) => onValueChange(handleChange(options))}
            options={projects}
            isSearchable={true}
          />
        </Element>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}

      <ErrorMessage className="mt-2">{errorMessage}</ErrorMessage>
    </>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Slider } from '$app/components/cards/Slider';
import { TabGroup } from '$app/components/TabGroup';
import { Element } from '$app/components/cards';
import { date, endpoint } from '$app/common/helpers';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Upload } from '$app/pages/settings/company/documents/components';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useFormatNumber } from '$app/common/hooks/useFormatNumber';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useColorScheme } from '$app/common/colors';
import { ResourceActions } from '$app/components/ResourceActions';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Divider } from '$app/components/cards/Divider';
import { Icon } from '$app/components/icons/Icon';
import { MdEdit } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import { Project } from '$app/common/interfaces/project';
import { useActions } from '../hooks';

export const projectSliderAtom = atom<Project | null>(null);
export const projectSliderVisibilityAtom = atom(false);

export function ProjectSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const actions = useActions();
  const formatMoney = useFormatMoney();
  const formatNumber = useFormatNumber();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [project, setProject] = useAtom(projectSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(projectSliderVisibilityAtom);

  return (
    <Slider
      size="regular"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setProject(null);
      }}
      title={`${t('project')} ${project?.name}`}
      topRight={
        project &&
        (hasPermission('edit_project') || entityAssigned(project)) ? (
          <ResourceActions
            label={t('actions')}
            resource={project}
            actions={[
              (resource: Project) => (
                <DropdownElement
                  to={route('/projects/:id/edit', { id: resource.id })}
                  icon={<Icon element={MdEdit} />}
                >
                  {t('edit')}
                </DropdownElement>
              ),
              () => <Divider withoutPadding />,
              ...actions,
            ]}
          />
        ) : null
      }
      withoutActionContainer
      withoutHeaderBorder
    >
      <TabGroup
        tabs={[t('overview'), t('documents')]}
        width="full"
        formatTabLabel={(tabIndex) => {
          if (tabIndex === 1) {
            return (
              <DocumentsTabLabel
                numberOfDocuments={project?.documents?.length}
                textCenter
              />
            );
          }
        }}
        withHorizontalPadding
        horizontalPaddingWidth="1.5rem"
      >
        <div className="space-y-2">
          <div className="px-6">
            <Element
              className="border-b border-dashed"
              leftSide={t('number')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {project ? project.number : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('task_rate')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {project
                ? formatMoney(
                    project.task_rate,
                    project.client?.country_id,
                    project.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('budgeted_hours')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {project ? formatNumber(project.budgeted_hours) : null}
            </Element>

            <Element leftSide={t('due_date')} pushContentToRight noExternalPadding>
              {project ? date(project.due_date, dateFormat) : null}
            </Element>
          </div>
        </div>

        <div className="px-4">
          <Upload
            endpoint={endpoint('/api/v1/projects/:id/upload', {
              id: project?.id,
            })}
            onSuccess={() => $refetch(['projects'])}
            widgetOnly
            disableUpload={
              !hasPermission('edit_project') && !entityAssigned(project)
            }
          />

          <DocumentsTable
            documents={project?.documents || []}
            onDocumentDelete={() => $refetch(['projects'])}
            disableEditableOptions={
              !entityAssigned(project, true) && !hasPermission('edit_project')
            }
          />
        </div>
      </TabGroup>
    </Slider>
  );
}

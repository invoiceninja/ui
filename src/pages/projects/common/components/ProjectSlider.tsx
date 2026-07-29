/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { date, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useFormatNumber } from '$app/common/hooks/useFormatNumber';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { $refetch } from '$app/common/hooks/useRefetch';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Project } from '$app/common/interfaces/project';
import { Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Slider } from '$app/components/cards/Slider';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import { calculateTime } from '$app/pages/tasks/common/helpers/calculate-time';
import { Upload } from '$app/pages/settings/company/documents/components';
import { atom, useAtom } from 'jotai';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { useActions } from '../hooks';

export const projectSliderAtom = atom<Project | null>(null);
export const projectSliderVisibilityAtom = atom(false);

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

interface StatCardProps {
  label: string;
  value: ReactNode;
}

function StatCard({ label, value }: StatCardProps) {
  const colors = useColorScheme();

  return (
    <div
      className="flex flex-col space-y-1 rounded-md border p-4"
      style={{ borderColor: colors.$20 }}
    >
      <span
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: colors.$17 }}
      >
        {label}
      </span>

      <span className="text-lg font-medium" style={{ color: colors.$3 }}>
        {value}
      </span>
    </div>
  );
}

export function ProjectSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const navigate = useNavigate();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const formatNumber = useFormatNumber();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const actions = useActions({
    showEditAction: true,
    showCommonBulkAction: true,
  });

  const [project, setProject] = useAtom(projectSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(projectSliderVisibilityAtom);

  const { data: resource } = useQuery({
    queryKey: ['/api/v1/projects', project?.id, 'slider'],
    queryFn: () =>
      request(
        'GET',
        endpoint(`/api/v1/projects/${project?.id}?include=client,tasks,documents`)
      ).then(
        (response: GenericSingleResourceResponse<Project>) => response.data.data
      ),
    enabled: project !== null && isVisible,
    staleTime: Infinity,
  });

  const currentProject = resource ?? project;

  const hasBudget = Boolean(
    currentProject && currentProject.budgeted_hours > 0
  );

  const onClose = () => {
    setIsSliderVisible(false);
    setProject(null);
  };

  return (
    <Slider
      size="large"
      visible={isVisible}
      onClose={onClose}
      title={currentProject?.name || `${t('project')}`}
      topRight={
        currentProject &&
        (hasPermission('edit_project') || entityAssigned(currentProject)) ? (
          <ResourceActions
            label={t('actions')}
            resource={currentProject}
            actions={actions}
          />
        ) : null
      }
      actionChildren={
        currentProject ? (
          <Button
            className="w-full"
            behavior="button"
            onClick={() => {
              onClose();
              navigate(route('/projects/:id', { id: currentProject.id }));
            }}
          >
            {t('view_project')}
          </Button>
        ) : null
      }
      withoutHeaderBorder
    >
      {currentProject ? (
        <TabGroup
          tabs={[t('overview'), t('documents')]}
          width="full"
          withHorizontalPadding
          horizontalPaddingWidth="1.5rem"
          formatTabLabel={(tabIndex) => {
            if (tabIndex === 1) {
              return (
                <DocumentsTabLabel
                  numberOfDocuments={currentProject.documents?.length}
                  textCenter
                />
              );
            }
          }}
        >
          <div className="space-y-4 pb-4">
            <p
              className="px-6 pt-4 text-sm font-medium uppercase tracking-wide"
              style={{ color: colors.$17 }}
            >
              {t('progress')}
            </p>

            <div className="grid grid-cols-2 gap-3 px-6">
              <StatCard
                label={t('logged')}
                value={`${formatNumber(currentProject.current_hours || 0)} h`}
              />

              <StatCard
                label={t('budgeted')}
                value={
                  hasBudget
                    ? `${formatNumber(currentProject.budgeted_hours)} h`
                    : '—'
                }
              />

              <StatCard
                label={t('remaining')}
                value={
                  hasBudget
                    ? `${formatNumber(
                        currentProject.budgeted_hours -
                          (currentProject.current_hours || 0)
                      )} h`
                    : '—'
                }
              />

              <StatCard label={t('projected')} value="—" />
            </div>

            <Divider withoutPadding borderColor={colors.$20} />

            <p
              className="px-6 pt-2 text-sm font-medium uppercase tracking-wide"
              style={{ color: colors.$17 }}
            >
              {t('details')}
            </p>

            <div className="px-6">
              <Element
                className="border-b border-dashed"
                leftSide={t('due_date')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                {currentProject.due_date
                  ? date(currentProject.due_date, dateFormat)
                  : '—'}
              </Element>

              <Element
                className={currentProject.color ? 'border-b border-dashed' : ''}
                leftSide={t('task_rate')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                {formatMoney(
                  currentProject.task_rate,
                  currentProject.client?.country_id,
                  currentProject.client?.settings.currency_id
                )}
              </Element>

              {Boolean(currentProject.color) && (
                <Element
                  leftSide={t('color')}
                  withoutWrappingLeftSide
                  pushContentToRight
                  noExternalPadding
                >
                  <div className="flex items-center justify-end space-x-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor: currentProject.color,
                        borderColor: colors.$20,
                      }}
                    />

                    <span>{currentProject.color}</span>
                  </div>
                </Element>
              )}
            </div>

            {currentProject.client && (
              <>
                <Divider withoutPadding borderColor={colors.$20} />

                <p
                  className="px-6 pt-2 text-sm font-medium uppercase tracking-wide"
                  style={{ color: colors.$17 }}
                >
                  {t('client')}
                </p>

                <div className="px-6">
                  <Box
                    className="flex items-center justify-between p-4 shadow-sm border w-full cursor-pointer rounded-md"
                    onClick={() => {
                      onClose();
                      navigate(
                        route('/clients/:id', {
                          id: currentProject.client_id,
                        })
                      );
                    }}
                    style={{ borderColor: colors.$20 }}
                    theme={{
                      backgroundColor: colors.$1,
                      hoverBackgroundColor: colors.$4,
                    }}
                  >
                    <span
                      className="font-medium text-sm"
                      style={{ color: colors.$3 }}
                    >
                      {currentProject.client.display_name}
                    </span>

                    <Icon
                      element={ChevronRight}
                      size={18}
                      color={colors.$17}
                    />
                  </Box>
                </div>
              </>
            )}

            {Boolean(currentProject.tasks?.length) && (
              <>
                <Divider withoutPadding borderColor={colors.$20} />

                <p
                  className="px-6 pt-2 text-sm font-medium uppercase tracking-wide"
                  style={{ color: colors.$17 }}
                >
                  {t('tasks')}
                </p>

                <div className="flex flex-col space-y-3 px-6">
                  {currentProject.tasks?.map((task) => (
                    <Box
                      key={task.id}
                      className="flex items-center justify-between p-4 shadow-sm border w-full cursor-pointer rounded-md"
                      onClick={() => {
                        onClose();
                        navigate(route('/tasks/:id/edit', { id: task.id }));
                      }}
                      style={{ borderColor: colors.$20 }}
                      theme={{
                        backgroundColor: colors.$1,
                        hoverBackgroundColor: colors.$4,
                      }}
                    >
                      <span
                        className="font-medium text-sm truncate"
                        style={{ color: colors.$3 }}
                      >
                        {task.description?.trim() ||
                          `${t('task')} #${task.number}`}
                      </span>

                      <div
                        className="flex items-center space-x-2 whitespace-nowrap"
                        style={{ color: colors.$17 }}
                      >
                        <span className="text-sm">
                          {calculateTime(task.time_log, {
                            inSeconds: false,
                          })}
                        </span>

                        <Icon
                          element={ChevronRight}
                          size={18}
                          color={colors.$17}
                        />
                      </div>
                    </Box>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="px-4 pt-4">
            <Upload
              endpoint={endpoint('/api/v1/projects/:id/upload', {
                id: currentProject.id,
              })}
              onSuccess={() => $refetch(['projects'])}
              widgetOnly
              disableUpload={
                !hasPermission('edit_project') &&
                !entityAssigned(currentProject)
              }
            />

            <DocumentsTable
              documents={currentProject.documents || []}
              onDocumentDelete={() => $refetch(['projects'])}
              disableEditableOptions={
                !entityAssigned(currentProject, true) &&
                !hasPermission('edit_project')
              }
            />
          </div>
        </TabGroup>
      ) : (
        <div className="flex flex-1 items-center justify-center py-12">
          <Spinner />
        </div>
      )}
    </Slider>
  );
}

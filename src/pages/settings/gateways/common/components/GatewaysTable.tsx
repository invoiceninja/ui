/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EntityState } from '$app/common/enums/entity-state';
import { getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { useBulk } from '$app/common/queries/company-gateways';
import { EntityStatus } from '$app/components/EntityStatus';
import { Tooltip } from '$app/components/Tooltip';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button, Checkbox, Link } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from '@hello-pangea/dnd';
import { arrayMoveImmutable } from 'array-move';
import { ChangeEvent, Fragment, useEffect, useRef, useState } from 'react';
import { Check } from 'react-feather';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdDelete,
  MdDragHandle,
  MdRestore,
  MdWarning,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { STRIPE_CONNECT } from '../../index/Gateways';
import { useGatewayUtilities } from '../hooks/useGatewayUtilities';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';

export function GatewaysTable() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const bulk = useBulk();

  const handleCompanySave = useHandleCompanySave();

  const mainCheckbox = useRef<HTMLInputElement>(null);

  const [currentGateways, setCurrentGateways] = useState<CompanyGateway[]>([]);

  const [selected, setSelected] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<CompanyGateway[]>(
    []
  );

  const { gateways, handleChange, handleRemoveGateway, handleReset } =
    useGatewayUtilities({
      currentGateways,
      setCurrentGateways,
    });

  const handleDeselect = () => {
    setSelected([]);

    if (mainCheckbox.current) {
      mainCheckbox.current.checked = false;
    }
  };

  const showRestoreBulkAction = () => {
    return selectedResources.every(
      (resource) => getEntityState(resource) !== EntityState.Active
    );
  };

  const onDragEnd = (result: DropResult) => {
    const sorted = arrayMoveImmutable(
      currentGateways,
      result.source.index,
      result.destination?.index as unknown as number
    );

    handleChange(
      'settings.company_gateway_ids',
      sorted.map(({ id }) => id).join(',')
    );

    setCurrentGateways(sorted);
  };

  const showWarning = (gateway: CompanyGateway) => {
    const gatewayConfig = JSON.parse(gateway.config);

    return STRIPE_CONNECT === gateway.gateway_key && !gatewayConfig.account_id;
  };

  const handleSaveBulkActionsChanges = (ids: string[]) => {
    handleChange(
      'settings.company_gateway_ids',
      currentGateways
        .filter(({ id }) => !ids.includes(id))
        .map(({ id }) => id)
        .join(',')
    );

    handleCompanySave();
  };

  useEffect(() => {
    if (gateways) {
      setCurrentGateways(gateways.filter((gateway) => gateway));
    }
  }, [gateways]);

  useEffect(() => {
    if (gateways) {
      const filteredSelectedResources = gateways.filter(
        (resource: CompanyGateway) => resource && selected.includes(resource.id)
      );

      setSelectedResources(filteredSelectedResources);
    }
  }, [selected]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <Dropdown label={t('more_actions')} disabled={!selected.length}>
          <DropdownElement
            onClick={() => {
              bulk(selected, 'archive').then(() =>
                handleSaveBulkActionsChanges(selected)
              );

              handleDeselect();
            }}
            icon={<Icon element={MdArchive} />}
          >
            {t('archive')}
          </DropdownElement>

          <DropdownElement
            onClick={() => {
              bulk(selected, 'delete').then(() => {
                console.log('ok2');
                handleSaveBulkActionsChanges(selected);
              });

              handleDeselect();
            }}
            icon={<Icon element={MdDelete} />}
          >
            {t('delete')}
          </DropdownElement>

          {showRestoreBulkAction() && (
            <DropdownElement
              onClick={() => {
                bulk(selected, 'restore').then(() =>
                  handleSaveBulkActionsChanges(selected)
                );

                handleDeselect();
              }}
              icon={<Icon element={MdRestore} />}
            >
              {t('restore')}
            </DropdownElement>
          )}
        </Dropdown>

        <div className="flex space-x-5">
          <Button behavior="button" type="secondary" onClick={handleReset}>
            {t('reset')}
          </Button>

          <Button
            behavior="button"
            onClick={() => navigate('/settings/gateways/create')}
          >
            {t('new_company_gateway')}
          </Button>
        </div>
      </div>

      <Table>
        <Thead>
          <Th>
            <Checkbox
              innerRef={mainCheckbox}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                Array.from(
                  document.querySelectorAll('.child-checkbox')
                ).forEach((checkbox: HTMLInputElement | any) => {
                  checkbox.checked = event.target.checked;

                  event.target.checked
                    ? setSelected((current) => [...current, checkbox.id])
                    : setSelected((current) =>
                        current.filter((value) => value !== checkbox.id)
                      );
                });
              }}
            />
          </Th>
          <Th>{t('status')}</Th>
          <Th>{t('label')}</Th>
          <Th>{t('test_mode')}</Th>
          <Th></Th>
        </Thead>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="gateways-table">
            {(droppableProvided) => (
              <Tbody
                {...droppableProvided.droppableProps}
                innerRef={droppableProvided.innerRef}
              >
                {currentGateways.map((gateway, index) => (
                  <Draggable
                    key={index}
                    draggableId={index.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <Tr
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        innerRef={provided.innerRef}
                        key={index}
                      >
                        <Td width="10%">
                          <Checkbox
                            checked={selected.includes(gateway.id)}
                            className="child-checkbox"
                            value={gateway.id}
                            id={gateway.id}
                            onValueChange={(value) =>
                              selected.includes(value)
                                ? setSelected((current) =>
                                    current.filter((v) => v !== value)
                                  )
                                : setSelected((current) => [...current, value])
                            }
                          />
                        </Td>

                        <Td width="30%">
                          <EntityStatus entity={gateway} />
                        </Td>

                        <Td width="30%">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={route(
                                '/settings/gateways/:id/edit?tab=:tab',
                                {
                                  id: gateway.id,
                                  tab: showWarning(gateway) ? 1 : 0,
                                }
                              )}
                            >
                              {gateway.label}
                            </Link>

                            {showWarning(gateway) && (
                              <Tooltip
                                message={
                                  t('stripe_connect_migration_title') as string
                                }
                                width="auto"
                                placement="top"
                              >
                                <div className="flex space-x-2">
                                  <MdWarning color="red" size={22} />
                                  <MdWarning color="red" size={22} />
                                </div>
                              </Tooltip>
                            )}
                          </div>
                        </Td>

                        <Td width="20%">
                          {gateway.test_mode ? <Check size={20} /> : ''}
                        </Td>

                        <Td width="25%">
                          <div className="flex items-center space-x-7 py-1">
                            <Button
                              behavior="button"
                              type="minimal"
                              onClick={() => handleRemoveGateway(gateway.id)}
                            >
                              {t('remove')}
                            </Button>

                            <Icon element={MdDragHandle} size={25} />
                          </div>
                        </Td>
                      </Tr>
                    )}
                  </Draggable>
                ))}

                {!currentGateways.length ? (
                  <Tr>
                    <Td colSpan={100}>{t('no_records_found')}.</Td>
                  </Tr>
                ) : (
                  <Fragment />
                )}

                {droppableProvided.placeholder}
              </Tbody>
            )}
          </Droppable>
        </DragDropContext>
      </Table>
    </div>
  );
}

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
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateChanges } from '$app/common/stores/slices/company-users';

interface Props {
  gateways: CompanyGateway[];
  allGateways?: CompanyGateway[];
}
export function GatewaysTable(props: Props) {
  const [t] = useTranslation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { gateways, allGateways } = props;

  const STRIPE_CONNECT = 'd14dd26a47cecc30fdd65700bfb67b34';

  const bulk = useBulk();

  const mainCheckbox = useRef<HTMLInputElement>(null);

  const [currentGateways, setCurrentGateways] = useState<CompanyGateway[]>([]);

  const [selected, setSelected] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<CompanyGateway[]>(
    []
  );

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

    setCurrentGateways(sorted);
  };

  const showWarning = (gateway: CompanyGateway) => {
    const gatewayConfig = JSON.parse(gateway.config);

    return STRIPE_CONNECT === gateway.gateway_key && !gatewayConfig.account_id;
  };

  const handleChange = (property: string, value: string) => {
    dispatch(
      updateChanges({
        object: 'company',
        property,
        value,
      })
    );
  };

  const handleRemoveGateway = (gatewayId: string) => {
    const filteredGateways = currentGateways.filter(
      ({ id }) => id !== gatewayId
    );

    setCurrentGateways(filteredGateways);

    handleChange(
      'settings.company_gateway_ids',
      filteredGateways.map(({ id }) => id).join(',')
    );
  };

  const handleReset = () => {
    if (allGateways) {
      setCurrentGateways(allGateways);

      handleChange(
        'settings.company_gateway_ids',
        allGateways.map(({ id }) => id).join(',')
      );
    }
  };

  useEffect(() => {
    if (gateways) {
      setCurrentGateways(gateways);
    }
  }, [gateways]);

  useEffect(() => {
    if (gateways) {
      const filteredSelectedResources = gateways.filter((resource: any) =>
        selected.includes(resource.id)
      );

      setSelectedResources(filteredSelectedResources);
    }
  }, [selected]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <Dropdown label={t('more_actions')} disabled={!selected.length}>
          <DropdownElement
            onClick={() => bulk(selected, 'archive')}
            icon={<Icon element={MdArchive} />}
          >
            {t('archive')}
          </DropdownElement>

          <DropdownElement
            onClick={() => bulk(selected, 'delete')}
            icon={<Icon element={MdDelete} />}
          >
            {t('delete')}
          </DropdownElement>

          {showRestoreBulkAction() && (
            <DropdownElement
              onClick={() => bulk(selected, 'restore')}
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
                        className="py-3"
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        innerRef={provided.innerRef}
                        key={index}
                      >
                        <Td width="20%">
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

                        <Td width="20%">
                          <EntityStatus entity={gateway} />
                        </Td>

                        <Td width="20%">
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

                        <Td width="20%">
                          <div className="flex items-center space-x-7">
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

                {!gateways.length ? (
                  <Tr>
                    <Td colSpan={100}>{t('no_records_found')}.</Td>
                  </Tr>
                ) : (
                  <Fragment />
                )}
              </Tbody>
            )}
          </Droppable>
        </DragDropContext>
      </Table>
    </div>
  );
}

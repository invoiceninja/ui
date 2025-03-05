/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '$app/common/interfaces/client';
import { InfoCard } from '$app/components/InfoCard';
import { useTranslation } from 'react-i18next';
import { MdChevronRight, MdDelete, MdLaunch, MdPayment } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import { GatewayLogoName, GatewayTypeIcon } from './GatewayTypeIcon';
import { useCompanyGatewaysQuery } from '$app/common/queries/company-gateways';
import { useEffect, useState } from 'react';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Link } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { useColorScheme } from '$app/common/colors';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import classNames from 'classnames';
import { $refetch } from '$app/common/hooks/useRefetch';
import styled from 'styled-components';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import {
  ConfirmActionModal,
  confirmActionModalAtom,
} from '$app/pages/recurring-invoices/common/components/ConfirmActionModal';
import { useSetAtom } from 'jotai';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { ChevronDown } from 'react-feather';

interface Props {
  client: Client;
}

const Div = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverBgColor};
  }
`;

export function Gateways(props: Props) {
  const [t] = useTranslation();

  const { client } = props;

  const { isAdmin } = useAdmin();
  const colors = useColorScheme();

  const { data: companyGatewaysResponse } = useCompanyGatewaysQuery();

  const [companyGateways, setCompanyGateways] = useState<CompanyGateway[]>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [deleteGatewayTokenId, setDeleteGatewayTokenId] = useState<string>('');

  const setIsConfirmationVisible = useSetAtom(confirmActionModalAtom);

  const getCompanyGateway = (gatewayId: string) => {
    return companyGateways?.find(({ id }) => id === gatewayId);
  };

  const isStripeGateway = (gatewayKey: string | undefined) => {
    return Boolean(
      gatewayKey &&
        (gatewayKey === 'd14dd26a37cecc30fdd65700bfb55b23' ||
          gatewayKey === 'd14dd26a47cecc30fdd65700bfb67b34')
    );
  };

  const handleDeleteGatewayToken = () => {
    if (deleteGatewayTokenId && !isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request(
        'DELETE',
        endpoint('/api/v1/client_gateway_tokens/:id', {
          id: deleteGatewayTokenId,
        })
      )
        .then(() => {
          toast.success('success');
          $refetch(['clients']);

          setDeleteGatewayTokenId('');
          setIsConfirmationVisible(false);
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const handleSetDefault = (id: string) => {
    request(
      'POST',
      endpoint('/api/v1/client_gateway_tokens/:id/setAsDefault', { id })
    ).then(() => {
      toast.success('success');
      $refetch(['clients']);
    });
  };

  useEffect(() => {
    if (companyGatewaysResponse) {
      setCompanyGateways(companyGatewaysResponse.data.data);
    }
  }, [companyGatewaysResponse]);

  useEffect(() => {
    if (deleteGatewayTokenId) {
      setIsConfirmationVisible(true);
    }
  }, [deleteGatewayTokenId]);

  return (
    <>
      <ConfirmActionModal
        onClick={() => handleDeleteGatewayToken()}
        onClose={() => setDeleteGatewayTokenId('')}
        disabledButton={isFormBusy}
      />

      <div className="col-span-12 md:col-span-12 lg:col-span-6 xl:col-span-4">
        <InfoCard
          title={t('payment_methods')}
          className="max-h-96 overflow-y-auto h-full"
        >
          {client.gateway_tokens.map((token) => (
            <div
              key={token.id}
              className={classNames('flex flex-col space-y-1.5 border-b py-4', {
                'h-22': !token.is_default,
                'h-20': token.is_default,
              })}
            >
              <div className="flex items-center justify-between h-12">
                <div className="flex flex-col space-y-1.5">
                  <div className="inline-flex items-center space-x-1">
                    <div>
                      <MdPayment fontSize={22} />
                    </div>
                    <div className="inline-flex items-center">
                      <span>{t('gateway')}</span>
                      <MdChevronRight size={20} />

                      <Link
                        to={route('/settings/gateways/:id/edit', {
                          id: token.company_gateway_id,
                        })}
                      >
                        {getCompanyGateway(token.company_gateway_id)?.label}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <GatewayTypeIcon
                      name={token.meta.brand as GatewayLogoName}
                    />

                    <div className="flex items-center">
                      <span className="mt-1">****</span>
                      <span className="ml-1">{token.meta.last4}</span>
                    </div>

                    <span>
                      {token.meta.exp_month}/{token.meta.exp_year}
                    </span>
                  </div>
                </div>

                <div
                  className={classNames('flex flex-col items-end h-full', {
                    'justify-center':
                      !isStripeGateway(
                        getCompanyGateway(token.company_gateway_id)?.gateway_key
                      ) && token.is_default,
                    'justify-between':
                      isStripeGateway(
                        getCompanyGateway(token.company_gateway_id)?.gateway_key
                      ) && token.is_default,
                  })}
                >
                  {isStripeGateway(
                    getCompanyGateway(token.company_gateway_id)?.gateway_key
                  ) && (
                    <Link
                      external
                      to={route(
                        'https://dashboard.stripe.com/customers/:customerReference',
                        {
                          customerReference: token.gateway_customer_reference,
                        }
                      )}
                    >
                      <Icon element={MdLaunch} size={18} />
                    </Link>
                  )}

                  {token.is_default && (
                    <div
                      className="inline-flex items-center text-xs"
                      style={{ height: '1.5rem' }}
                    >
                      <div
                        className="flex items-center border pr-2 pl-3 rounded-l-full h-full"
                        style={{
                          borderColor: colors.$5,
                          backgroundColor: colors.$5,
                        }}
                      >
                        {t('default')}
                      </div>

                      {isAdmin && (
                        <Dropdown
                          className="rounded-bl-none rounded-tl-none h-full px-1 border-gray-200 border-l-1 border-y-0 border-r-0"
                          customLabel={
                            <Div
                              className="cursor-pointer pl-1 pr-2 border border-l-0 rounded-r-full h-full"
                              style={{
                                borderColor: colors.$5,
                                paddingTop: '0.16rem',
                                paddingBottom: '0.16rem',
                              }}
                              theme={{ hoverBgColor: colors.$4 }}
                            >
                              <Icon
                                element={ChevronDown}
                                style={{ width: '1.1rem', height: '1.1rem' }}
                              />
                            </Div>
                          }
                          minWidth="9rem"
                          maxWidth="11rem"
                        >
                          <DropdownElement
                            icon={<Icon element={MdDelete} />}
                            onClick={() => setDeleteGatewayTokenId(token.id)}
                          >
                            {t('delete')}
                          </DropdownElement>
                        </Dropdown>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {!token.is_default && (
                <div className="flex items-center justify-start">
                  <div
                    className="inline-flex items-center text-xs cursor-pointer self-start"
                    style={{ height: '1.5rem' }}
                  >
                    <Div
                      className="flex items-center border pr-2 pl-3 rounded-l-full h-full"
                      onClick={() => handleSetDefault(token.id)}
                      style={{
                        borderColor: colors.$5,
                      }}
                      theme={{ hoverBgColor: colors.$5 }}
                    >
                      {t('save_as_default')}
                    </Div>

                    {isAdmin && (
                      <Dropdown
                        className="rounded-bl-none rounded-tl-none h-full px-1 border-l-1 border-y-0 border-r-0"
                        customLabel={
                          <Div
                            className="cursor-pointer pl-1 pr-2 border border-l-0 rounded-r-full h-full"
                            style={{
                              borderColor: colors.$5,
                              paddingTop: '0.16rem',
                              paddingBottom: '0.16rem',
                            }}
                            theme={{ hoverBgColor: colors.$5 }}
                          >
                            <Icon
                              element={ChevronDown}
                              style={{ width: '1.1rem', height: '1.1rem' }}
                            />
                          </Div>
                        }
                        minWidth="10rem"
                        maxWidth="12rem"
                        style={{
                          borderColor: colors.$5,
                        }}
                      >
                        <DropdownElement
                          icon={<Icon element={MdDelete} />}
                          onClick={() => setDeleteGatewayTokenId(token.id)}
                        >
                          {t('delete')}
                        </DropdownElement>
                      </Dropdown>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </InfoCard>
      </div>
    </>
  );
}

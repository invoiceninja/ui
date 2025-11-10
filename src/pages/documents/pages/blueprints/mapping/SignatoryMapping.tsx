/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '$app/components/forms';
import { InputLabel } from '$app/components/forms/InputLabel';
import { Default } from '$app/components/layouts/Default';
import { Card, Element } from '$app/components/cards';
import { Page } from '$app/components/Breadcrumbs';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useColorScheme } from '$app/common/colors';
import { Client } from '$app/common/interfaces/client';
import { User as DocuNinjaUser } from '$app/common/interfaces/docuninja/api';
import { ClientContact } from '$app/common/interfaces/docuninja/api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { request } from '$app/common/helpers/request';
import { docuNinjaEndpoint, endpoint } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { AxiosResponse } from 'axios';
import { GenericSingleResponse, Document } from '$app/common/interfaces/docuninja/api';
import { toast } from '$app/common/helpers/toast/toast';
import { ComboboxAsync, Entry } from '$app/components/forms/Combobox';
import classNames from 'classnames';

interface SignatoryMapping {
  blueprint_signatory_id: string;
  id: string;
  signatory_type: 'user' | 'contact';
  client?: Client & { contact_key?: string };
}

interface SignatoryMap {
  blueprint_signatory_id: string;
  type?: 'user' | 'contact';
  client?: Client;
  contact?: ClientContact;
  user?: DocuNinjaUser;
  contact_key?: string;
}

interface SignatoryInfo {
  id: string;
  color: string;
}

export default function SignatoryMapping() {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const company = useCurrentCompany();
  const colors = useColorScheme();

  const { blueprint, signatoryIds, signatoryInfo } = (location.state as any) || {};

  const [mappings, setMappings] = useState<Record<string, SignatoryMap>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSignatoryColor = (signatoryId: string): string => {
    if (signatoryInfo && signatoryInfo[signatoryId]) {
      return signatoryInfo[signatoryId].color || '#FF5733';
    }
    return '#FF5733'; // Default color
  };

  const handleClientChange = (
    blueprintSignatoryId: string,
    entry: Entry<Client>
  ) => {
    const client = entry.resource;
    if (!client || !client.contacts?.[0]) {
      return;
    }

    const contact = client.contacts[0];

    setMappings((prev) => ({
      ...prev,
      [blueprintSignatoryId]: {
        blueprint_signatory_id: blueprintSignatoryId,
        type: 'contact',
        client,
        contact: contact as any,
        contact_key: contact.contact_key || '',
      },
    }));

    setErrors((prevErrors) => {
      const { [blueprintSignatoryId]: _, ...rest } = prevErrors;
      return rest;
    });
  };

  const handleUserChange = (
    blueprintSignatoryId: string,
    entry: Entry<DocuNinjaUser>
  ) => {
    const user = entry.resource;
    if (!user) {
      return;
    }

    setMappings((prev) => ({
      ...prev,
      [blueprintSignatoryId]: {
        blueprint_signatory_id: blueprintSignatoryId,
        type: 'user',
        user,
      },
    }));

    setErrors((prevErrors) => {
      const { [blueprintSignatoryId]: _, ...rest } = prevErrors;
      return rest;
    });
  };

  const handleClear = (blueprintSignatoryId: string) => {
    setMappings((prev) => {
      const { [blueprintSignatoryId]: _, ...rest } = prev;
      return rest;
    });
    
    // Also clear error for this signatory
    setErrors((prevErrors) => {
      const { [blueprintSignatoryId]: _, ...rest } = prevErrors;
      return rest;
    });
  };

  const handleSubmit = () => {
    const validationErrors: Record<string, string> = {};

    signatoryIds.forEach((id: string) => {
      const mapping = mappings[id];
      if (!mapping || (!mapping.user && !mapping.contact)) {
        validationErrors[id] = t('please_select_signer');
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    toast.processing();

    const signatoryMappings: SignatoryMapping[] = signatoryIds
      .filter((id: string) => mappings[id])
      .map((id: string) => {
        const mapping = mappings[id];
        const mappingData: SignatoryMapping = {
          blueprint_signatory_id: id,
          id: '',
          signatory_type: mapping.type!,
        };

        if (mapping.type === 'user' && mapping.user) {
          mappingData.id = mapping.user.id;
        } else if (mapping.type === 'contact' && mapping.contact) {
          mappingData.id = 'contact|' + (mapping.contact_key || '');
          if (mapping.client) {
            mappingData.client = {
              ...mapping.client,
              contact_key: mapping.contact_key,
            };
          }
        }

        return mappingData;
      });

    const payload: any = {
      action: 'make_document',
      signatory_mappings: signatoryMappings,
    };

    request(
      'POST',
      docuNinjaEndpoint(`/api/blueprints/${blueprint.id}/action`),
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      }
    )
      .then((response: AxiosResponse<GenericSingleResponse<Document>>) => {
        toast.success('document_created');
        navigate(route('/docuninja/:id/builder', { id: response.data.data.id }));
      })
      .catch((error) => {
        toast.error('error_refresh_page');
        console.error(error);
      })
      .finally(() => setIsSubmitting(false));
  };

  if (!blueprint || !signatoryIds) {
    return (
      <Default breadcrumbs={[]}>
        <Card>
          <div className="text-center py-8">
            <p>{t('invalid_state')}</p>
          </div>
        </Card>
      </Default>
    );
  }

  const pages: Page[] = [
    { name: t('docuninja'), href: '/docuninja' },
    { name: t('templates'), href: '/docuninja/templates' },
    { name: t('map_signatories'), href: '#' },
  ];

  const dropdownLabelFn = (client: Client) => {
    return (
      <div className="flex items-center space-x-1">
        <span>{client.display_name}</span>
        {client.contacts[0]?.email && (
          <span className="text-xs">({client.contacts[0].email})</span>
        )}
      </div>
    );
  };

  return (
    <Default title={t('map_signatories')} breadcrumbs={pages}>
      <div className="grid grid-cols-12 gap-4">
        <Card
          className="col-span-12 xl:col-span-8"
          withContainer
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          <Element leftSide={t('template')}>
            <div className="text-sm font-medium" style={{ color: colors.$3 }}>
              {blueprint.name}
            </div>
          </Element>

          <Element leftSide={t('instructions')}>
            <div className="text-sm" style={{ color: colors.$3 }}>
              {t('map_signatories_instructions')}
            </div>
          </Element>

          <div className="pt-4">
            {signatoryIds.map((signatoryId: string, index: number) => {
              const mapping = mappings[signatoryId];
              const error = errors[signatoryId];
              const signatoryColor = getSignatoryColor(signatoryId);
              const hasClient = mapping?.type === 'contact';
              const hasUser = mapping?.type === 'user';
              
              return (
                <div
                  key={signatoryId}
                  className={classNames(
                    'pb-4 pt-4 border-b border-dashed',
                    {
                      'border-b-0': index === signatoryIds.length - 1,
                    }
                  )}
                  style={{ borderColor: colors.$24 }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-5 h-5 rounded flex-shrink-0 mt-1"
                      style={{ backgroundColor: signatoryColor }}
                    />
                    <div className="flex-1 space-y-3">
                      <Element leftSide={t('signatory')} noExternalPadding>
                        <InputLabel>{index + 1}</InputLabel>
                      </Element>

                      {!hasUser && (
                        <Element leftSide={t('client')} noExternalPadding>
                          <ComboboxAsync<Client>
                            inputOptions={{
                              value: mapping?.client?.id || null,
                            }}
                            endpoint={endpoint('/api/v1/clients')}
                            readonly={false}
                            onDismiss={() => handleClear(signatoryId)}
                            entryOptions={{
                                id: 'id',
                                label: 'display_name',
                                value: 'id',
                                customSearchableValue: (client) =>
                                  client.contacts.map(({ email }) => email).join(','),
                                dropdownLabelFn,
                                inputLabelFn: (client) => client?.display_name || '',
                              }}
                            onChange={(entry) => handleClientChange(signatoryId, entry)}
                            sortBy="display_name|asc"
                            errorMessage={error && !hasClient ? error : undefined}
                            querySpecificEntry="/api/v1/clients/:id"
                            key={`client-combobox-${signatoryId}`}
                          />
                        </Element>
                      )}

                      {!hasClient && (
                        <Element leftSide={t('user')} noExternalPadding>
                          <ComboboxAsync<DocuNinjaUser>
                            inputOptions={{
                              value: mapping?.user?.id || null,
                            }}
                            endpoint={docuNinjaEndpoint(
                              `/api/users?ninjaCompanyKey=${company.company_key}`
                            )}
                            readonly={false}
                            onDismiss={() => handleClear(signatoryId)}
                            querySpecificEntry={docuNinjaEndpoint('/api/users/:id')}
                            entryOptions={{
                              id: 'id',
                              label: 'email',
                              value: 'id',
                              searchable: 'email',
                              dropdownLabelFn: (user: DocuNinjaUser) => {
                                const name = user?.first_name || user?.last_name
                                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                  : user?.email;
                                return name || '';
                              },
                              inputLabelFn: (user?: DocuNinjaUser) => {
                                if (!user) return '';
                                const name = user?.first_name || user?.last_name
                                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                  : user?.email;
                                return name || '';
                              },
                            }}
                            onChange={(entry) => handleUserChange(signatoryId, entry)}
                            sortBy="created_at|desc"
                            errorMessage={error && !hasUser ? error : undefined}
                            headers={{
                              Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
                            }}
                            key={`user-combobox-${signatoryId}`}
                          />
                        </Element>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card
          className="col-span-12 xl:col-span-4"
          withContainer
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          <div className="flex flex-col space-y-4">
            <div>
              <InputLabel className="mb-2">{t('summary')}</InputLabel>
              <div className="text-sm space-y-2">
                <div style={{ color: colors.$3 }}>
                  {t('total_signatories')}: {signatoryIds.length}
                </div>
                <div style={{ color: colors.$3 }}>
                  {t('mapped')}: {Object.keys(mappings).filter(id => mappings[id]).length}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3 pt-4">
              <Button
                type="primary"
                behavior="button"
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(mappings).filter(id => mappings[id]).length !== signatoryIds.length}
                className="w-full"
              >
                {t('create')}
              </Button>
              
              <Button
                type="secondary"
                behavior="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="w-full"
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Default>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { apiEndpoint, isHosted } from '$app/common/helpers';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Card, Element } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { Gateway } from '$app/common/interfaces/statics';
import collect from 'collect.js';
import { STRIPE_CONNECT } from '../../index/Gateways';

interface Props {
  companyGateway: CompanyGateway;
  gateway: Gateway;
}

export function WebhookConfiguration(props: Props) {
  const [t] = useTranslation();
  const company = useCurrentCompany();

  const { companyGateway } = props;

  if (companyGateway.gateway_key === STRIPE_CONNECT && isHosted()) {
    return (
      <Card title={t('settings')}>
        <Element leftSide={t('general')}>
          <ul className="list-disc">
            {collect(Object.entries(companyGateway?.settings?.general || {}))
              .filter(([, value]) => value !== null && value !== '')
              .map(([key, value]) => `${key}: ${value}`)
              .unique()
              .all()
              .sort()
              .map((element: string, index: number) => (
                <li key={index}>{element}</li>
              ))}
          </ul>
        </Element>

        <Element leftSide={t('requirements')}>
          <ul className="list-disc">
            {companyGateway?.settings?.requirements?.map(
              (requirementGroup, index) => {
                if (
                  ('verification' in requirementGroup &&
                    Array.isArray(requirementGroup.verification) &&
                    !requirementGroup.verification.length) ||
                  ('currently_due' in requirementGroup &&
                    Array.isArray(requirementGroup.currently_due) &&
                    !requirementGroup.currently_due.length) ||
                  ('past_due' in requirementGroup &&
                    Array.isArray(requirementGroup.past_due) &&
                    !requirementGroup.past_due.length)
                ) {
                  return null;
                }

                return (
                  <li key={index}>
                    {'verification' in requirementGroup &&
                      Array.isArray(requirementGroup.verification) &&
                      requirementGroup.verification.length > 0 && (
                        <div className="flex items-center gap-4">
                          <span className="min-w-24">{t('verification')}:</span>

                          <ul className="list-disc">
                            {requirementGroup.verification.map(
                              (verificationItem, vIndex) =>
                                Object.entries(verificationItem).map(
                                  ([key, value], subIndex) => (
                                    <li
                                      key={`verification-${index}-${vIndex}-${subIndex}`}
                                      className="ml-4"
                                    >
                                      <strong>{key}:</strong>{' '}
                                      {value?.toString()}
                                    </li>
                                  )
                                )
                            )}
                          </ul>
                        </div>
                      )}

                    {'currently_due' in requirementGroup &&
                      Array.isArray(requirementGroup.currently_due) &&
                      requirementGroup.currently_due.length > 0 && (
                        <div className="flex gap-4">
                          <span className="min-w-24">
                            {t('currently_due')}:
                          </span>
                          <ul className="list-disc">
                            {requirementGroup.currently_due.map(
                              (currentItem, cIndex) =>
                                Object.entries(currentItem).map(
                                  ([key, value], subIndex) => (
                                    <li
                                      key={`current-${index}-${cIndex}-${subIndex}`}
                                      className="ml-4"
                                    >
                                      <strong>{key}:</strong>{' '}
                                      {value?.toString()}
                                    </li>
                                  )
                                )
                            )}
                          </ul>
                        </div>
                      )}

                    {'past_due' in requirementGroup &&
                      Array.isArray(requirementGroup.past_due) &&
                      requirementGroup.past_due.length > 0 && (
                        <div className="flex gap-4">
                          <span className="min-w-24">{t('past_due')}:</span>
                          <ul className="list-disc">
                            {requirementGroup.past_due.map((pastItem, pIndex) =>
                              Object.entries(pastItem).map(
                                ([key, value], subIndex) => (
                                  <li
                                    key={`past-${index}-${pIndex}-${subIndex}`}
                                    className="ml-4"
                                  >
                                    <strong>{key}:</strong> {value?.toString()}
                                  </li>
                                )
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </li>
                );
              }
            )}
          </ul>
        </Element>

        <Element leftSide={t('capabilities')}>
          <ul className="list-disc">
            {Object.entries(companyGateway?.settings?.capabilities || {})
              .filter(([, value]) => value !== null && value !== '')
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, value], index) => (
                <li key={index}>{`${t(key)}: ${t(value)}`}</li>
              ))}
          </ul>
        </Element>
      </Card>
    );
  }

  return (
    <Card title={t('webhooks')}>
      <Element leftSide={t('webhook_url')}>
        <CopyToClipboard
          className="break-all"
          text={`${apiEndpoint()}/payment_webhook/${company.company_key}/${
            props.companyGateway.id
          }`}
        />
      </Element>

      <Element leftSide={t('supported_events')}>
        <ul className="list-disc">
          {collect(Object.values(props.gateway.options))
            .pluck('webhooks')
            .flatten()
            .unique()
            .whereNotNull()
            .all()
            .sort()
            .map((element: string, index: number) => {
              return <li key={index}>{element}</li>;
            })}
        </ul>
      </Element>
    </Card>
  );
}

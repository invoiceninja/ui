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
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useColorScheme } from '$app/common/colors';
import { ResourceActions } from '$app/components/ResourceActions';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Divider } from '$app/components/cards/Divider';
import { Icon } from '$app/components/icons/Icon';
import { MdEdit } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import { Credit } from '$app/common/interfaces/credit';
import { CreditStatus } from './CreditStatus';
import { useActions } from '../hooks';

export const creditSliderAtom = atom<Credit | null>(null);
export const creditSliderVisibilityAtom = atom(false);

export function CreditSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const actions = useActions();
  const formatMoney = useFormatMoney();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [credit, setCredit] = useAtom(creditSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(creditSliderVisibilityAtom);

  return (
    <Slider
      size="regular"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setCredit(null);
      }}
      title={`${t('credit')} ${credit?.number || ''}`}
      topRight={
        credit && (hasPermission('edit_credit') || entityAssigned(credit)) ? (
          <ResourceActions
            label={t('actions')}
            resource={credit}
            actions={[
              (resource: Credit) => (
                <DropdownElement
                  to={route('/credits/:id/edit', { id: resource.id })}
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
                numberOfDocuments={credit?.documents?.length}
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
              leftSide={t('amount')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {credit
                ? formatMoney(
                    credit.amount,
                    credit.client?.country_id,
                    credit.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('balance_due')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {credit
                ? formatMoney(
                    credit.balance,
                    credit.client?.country_id,
                    credit.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('date')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {credit ? date(credit.date, dateFormat) : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('valid_until')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {credit ? date(credit.due_date, dateFormat) : null}
            </Element>

            <Element leftSide={t('status')} pushContentToRight noExternalPadding>
              {credit ? <CreditStatus entity={credit} /> : null}
            </Element>
          </div>
        </div>

        <div className="px-4">
          <Upload
            endpoint={endpoint('/api/v1/credits/:id/upload', {
              id: credit?.id,
            })}
            onSuccess={() => $refetch(['credits'])}
            widgetOnly
            disableUpload={
              !hasPermission('edit_credit') && !entityAssigned(credit)
            }
          />

          <DocumentsTable
            documents={credit?.documents || []}
            onDocumentDelete={() => $refetch(['credits'])}
            disableEditableOptions={
              !entityAssigned(credit, true) && !hasPermission('edit_credit')
            }
          />
        </div>
      </TabGroup>
    </Slider>
  );
}

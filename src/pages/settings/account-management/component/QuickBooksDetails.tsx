/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { Element } from '$app/components/cards';
import { Button, SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import {
  Quickbooks,
  QuickbooksSettings,
} from '$app/common/interfaces/quickbooks';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { InitialSyncModal } from './InitialSyncModal';
import { QBOUpdatesModal } from './QBOUpdatesModal';

interface QuickBooksDetailsProps {
  quickbooks: Quickbooks;
  quickbooksSettings: QuickbooksSettings | undefined;
  onDisconnectClick: () => void;
  onIncomeAccountIdChange: (value: string) => void;
  isFormBusy: boolean;
  errors: ValidationBag | undefined;
}

export function QuickBooksDetails({
  quickbooks,
  quickbooksSettings,
  onDisconnectClick,
  onIncomeAccountIdChange,
  isFormBusy,
  errors,
}: QuickBooksDetailsProps) {
  const [t] = useTranslation();
  const companyChanges = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const [isInitialSyncModalVisible, setIsInitialSyncModalVisible] =
    useState<boolean>(false);

  const [isQboUpdatesModalVisible, setIsQboUpdatesModalVisible] =
    useState<boolean>(false);

  return (
    <div className="flex flex-col">
      <Element leftSide={t('status')} noExternalPadding>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">{t('connected')}</span>
          <Button
            type="minimal"
            behavior="button"
            onClick={onDisconnectClick}
            disabled={isFormBusy}
            className="bg-red-500 border-red-500 text-white ml-auto"
          >
            {t('disconnect')}
          </Button>
        </div>
      </Element>

      {quickbooks.companyName && (
        <Element leftSide={t('company_name')} noExternalPadding>
          <span className="text-sm">{quickbooks.companyName}</span>
        </Element>
      )}

      {quickbooks.realmID && (
        <Element leftSide={t('realm_id')} noExternalPadding>
          <span className="text-sm">{quickbooks.realmID}</span>
        </Element>
      )}

      <Element leftSide={t('automatic_taxes')} noExternalPadding>
        <SelectField
          value={
            companyChanges?.quickbooks?.settings?.automatic_taxes
              ? 'true'
              : 'false'
          }
          onValueChange={(value) =>
            handleChange(
              'quickbooks.settings.automatic_taxes',
              value === 'true'
            )
          }
          customSelector
          dismissable={false}
          errorMessage={errors?.errors?.['quickbooks.settings.automatic_taxes']}
        >
          <option value="true">{t('yes')}</option>
          <option value="false">{t('no')}</option>
        </SelectField>
      </Element>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="secondary"
          behavior="button"
          onClick={() => setIsQboUpdatesModalVisible(true)}
          disabled={isFormBusy}
        >
          {t('qbo_updates')}
        </Button>

        <Button
          type="primary"
          behavior="button"
          onClick={() => setIsInitialSyncModalVisible(true)}
          disabled={isFormBusy}
        >
          {t('initial_sync')}
        </Button>
      </div>

      <InitialSyncModal
        visible={isInitialSyncModalVisible}
        onClose={() => setIsInitialSyncModalVisible(false)}
      />

      <QBOUpdatesModal
        visible={isQboUpdatesModalVisible}
        onClose={() => setIsQboUpdatesModalVisible(false)}
      />
    </div>
  );
}

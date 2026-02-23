/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo, useState } from 'react';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import {
  QuickbooksSettings,
  QuickbooksSyncDirection,
} from '$app/common/interfaces/quickbooks';
import { useQuickbooksConnection } from '../common/hooks/useQuickbooksConnection';
import { useQuickbooksConnect } from '../common/hooks/useQuickbooksConnect';
import { useQuickbooksDisconnect } from '../common/hooks/useQuickbooksDisconnect';
import { useQuickbooksSync } from '../common/hooks/useQuickbooksSync';
import { QuickBooksDetails } from './QuickBooksDetails';
import { ConnectedDots } from '$app/components/icons/ConnectedDots';
import { ArrowRight } from '$app/components/icons/ArrowRight';
import styled from 'styled-components';
import { IncomeAccountSelector } from '$app/components/IncomeAccountSelector';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../../common/hooks/useHandleCompanySave';
import { useAtomValue } from 'jotai';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function QuickBooks() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const companyChanges = useInjectCompanyChanges();
  const { quickbooks, isConnected } = useQuickbooksConnection();

  const handleChange = useHandleCurrentCompanyChangeProperty();
  const { handleConnect, isFormBusy: isConnectBusy } = useQuickbooksConnect();

  const {
    handleDisconnect,
    isFormBusy: isDisconnectBusy,
    errors,
  } = useQuickbooksDisconnect();
  const {
    syncSelections,
    setSyncSelection,
    handleInitialSync,
    isSyncBusy,
    isSyncInfoModalVisible,
    setIsSyncInfoModalVisible,
    hasSyncSelection,
  } = useQuickbooksSync();

  const onSave = useHandleCompanySave({
    onFinally: () => setIsSyncInfoModalVisible(false),
  });

  const isSavingCompany = useAtomValue(isCompanySettingsFormBusy);
  const [isDisconnectModalVisible, setIsDisconnectModalVisible] =
    useState<boolean>(false);

  const quickbooksSettings: QuickbooksSettings | undefined = isConnected
    ? companyChanges?.quickbooks?.settings ?? quickbooks?.settings
    : undefined;

  const handleSyncDirectionChange = (
    entity: string,
    direction: QuickbooksSyncDirection
  ) => {
    handleChange(`quickbooks.settings.${entity}.direction`, direction);
  };

  const handleIncomeAccountIdChange = (value: string) => {
    handleChange('quickbooks.settings.default_income_account', value || null);
  };

  const TABS = useMemo(() => {
    return quickbooksSettings
      ? [t('connect'), t('import'), t('sync')]
      : [t('connect'), t('import')];
  }, [quickbooksSettings]);

  return (
    <>
      {isConnected && quickbooks ? (
        <div className="flex flex-col space-y-4">
          <h3 className="leading-6 font-medium text-lg">QuickBooks</h3>

          <QuickBooksDetails
            quickbooks={quickbooks}
            quickbooksSettings={quickbooksSettings}
            onDisconnectClick={() => setIsDisconnectModalVisible(true)}
            onIncomeAccountIdChange={handleIncomeAccountIdChange}
            isFormBusy={isConnectBusy || isDisconnectBusy}
            errors={errors}
          />
        </div>
      ) : (
        <Box
          className="flex justify-between items-center p-4 border shadow-sm w-full rounded-md cursor-pointer"
          theme={{
            backgroundColor: colors.$1,
            hoverBackgroundColor: colors.$4,
          }}
          onClick={handleConnect}
          style={{ borderColor: colors.$24 }}
        >
          <div className="flex items-center space-x-2">
            <ConnectedDots color={colors.$3} size="1.4rem" />

            <span className="text-sm" style={{ color: colors.$3 }}>
              QuickBooks
            </span>

            {isConnected && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: '#16a34a18',
                  color: '#16a34a',
                }}
              >
                {t('connected')}
              </span>
            )}
          </div>

          <div>
            <ArrowRight color={colors.$3} size="1.4rem" strokeWidth="1.5" />
          </div>
        </Box>
      )}

      <Modal
        title={t('default_income_account')}
        visible={isSyncInfoModalVisible}
        onClose={() => setIsSyncInfoModalVisible(false)}
        overflowVisible
      >
        <div className="flex flex-col space-y-4">
          <IncomeAccountSelector
            label={t('default_income_account')}
            value={
              companyChanges?.quickbooks?.settings?.default_income_account || ''
            }
            onValueChange={(value) =>
              handleChange(
                'quickbooks.settings.default_income_account',
                value || null
              )
            }
            errorMessage={
              errors?.errors?.['quickbooks.settings.default_income_account']
            }
          />

          <Button
            behavior="button"
            onClick={onSave}
            disabled={
              isSavingCompany ||
              !companyChanges?.quickbooks?.settings?.default_income_account
            }
            disableWithoutIcon={isSavingCompany}
          >
            {t('save')}
          </Button>
        </div>
      </Modal>

      <Modal
        title={t('disconnect')}
        visible={isDisconnectModalVisible}
        onClose={() => setIsDisconnectModalVisible(false)}
      >
        <div className="flex flex-col space-y-6">
          <span className="font-medium text-sm">{t('are_you_sure')}</span>

          <Button
            behavior="button"
            onClick={() => {
              setIsDisconnectModalVisible(false);
              handleDisconnect();
            }}
          >
            {t('continue')}
          </Button>
        </div>
      </Modal>
    </>
  );
}

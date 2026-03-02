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
import { Modal } from '$app/components/Modal';
import { TabGroup } from '$app/components/TabGroup';
import { Button } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { QuickbooksSettings } from '$app/common/interfaces/quickbooks';
import { useQuickbooksConnection } from '../common/hooks/useQuickbooksConnection';
import { useQuickbooksConnect } from '../common/hooks/useQuickbooksConnect';
import { useQuickbooksDisconnect } from '../common/hooks/useQuickbooksDisconnect';
import { QuickBooksDetails } from './QuickBooksDetails';
import { QuickBooksImportTab } from './QuickBooksImportTab';
import { QuickBooksSyncTab } from './QuickBooksSyncTab';
import { ConnectedDots } from '$app/components/icons/ConnectedDots';
import { ArrowRight } from '$app/components/icons/ArrowRight';
import { IncomeAccountSelector } from '$app/components/IncomeAccountSelector';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../../common/hooks/useHandleCompanySave';
import { useAtomValue } from 'jotai';
import styled from 'styled-components';
import { usePaidOrSelfHost } from '$app/common/hooks/usePaidOrSelfhost';

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
  const isSavingCompany = useAtomValue(isCompanySettingsFormBusy);

  const { quickbooks, isConnected } = useQuickbooksConnection();

  const handleChange = useHandleCurrentCompanyChangeProperty();
  const { handleConnect, isFormBusy: isConnectBusy } = useQuickbooksConnect();

  const {
    handleDisconnect,
    isFormBusy: isDisconnectBusy,
    errors,
  } = useQuickbooksDisconnect();

  const [isConnectModalVisible, setIsConnectModalVisible] = useState(false);
  const [isSyncInfoModalVisible, setIsSyncInfoModalVisible] = useState(false);
  const [isDisconnectModalVisible, setIsDisconnectModalVisible] =
    useState<boolean>(false);

  const onSave = useHandleCompanySave({
    onFinally: () => setIsSyncInfoModalVisible(false),
  });

  const quickbooksSettings: QuickbooksSettings | undefined = isConnected
    ? companyChanges?.quickbooks?.settings ?? quickbooks?.settings
    : undefined;

    const isPaidOrSelfHost = usePaidOrSelfHost();

  return (
    <>
      {isConnected && quickbooks && isPaidOrSelfHost ? (
        <div className="flex flex-col space-y-4">
          <h3 className="leading-6 font-medium text-lg">QuickBooks</h3>

          <TabGroup tabs={[t('connect'), t('import'), t('sync_settings')]}>
            <div>
              <QuickBooksDetails
                quickbooks={quickbooks}
                quickbooksSettings={quickbooksSettings}
                onDisconnectClick={() => setIsDisconnectModalVisible(true)}
                isFormBusy={isConnectBusy || isDisconnectBusy}
                errors={errors}
              />
            </div>

            <div>
              <QuickBooksImportTab />
            </div>

            <div>
              <QuickBooksSyncTab />
            </div>
          </TabGroup>
        </div>
      ) : (
        <Box
          className="flex justify-between items-center p-4 border shadow-sm w-full rounded-md cursor-pointer"
          theme={{
            backgroundColor: colors.$1,
            hoverBackgroundColor: colors.$4,
          }}
          onClick={() => setIsConnectModalVisible(true)}
          style={{ borderColor: colors.$24 }}
        >
          <div className="flex items-center space-x-2">
            <ConnectedDots color={colors.$3} size="1.4rem" />

            <span className="text-sm" style={{ color: colors.$3 }}>
              QuickBooks
            </span>
          </div>

          <div>
            <ArrowRight color={colors.$3} size="1.4rem" strokeWidth="1.5" />
          </div>
        </Box>
      )}

      <Modal
        title="QuickBooks"
        visible={isConnectModalVisible}
        onClose={() => setIsConnectModalVisible(false)}
      >
        <div className="flex flex-col space-y-4">
          <p className="text-sm" style={{ color: colors.$3 }}>
            {t('quickbooks_connect_description')}
          </p>

          <Button
            behavior="button"
            onClick={() => {
              setIsConnectModalVisible(false);
              handleConnect();
            }}
            disabled={isConnectBusy}
            disableWithoutIcon={isConnectBusy}
          >
            {t('connect')}
          </Button>
        </div>
      </Modal>

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
              companyChanges?.quickbooks?.settings?.qb_income_account_id || ''
            }
            onValueChange={(value) =>
              handleChange(
                'quickbooks.settings.qb_income_account_id',
                value || null
              )
            }
            errorMessage={
              errors?.errors?.['quickbooks.settings.qb_income_account_id']
            }
          />

          <Button
            behavior="button"
            onClick={onSave}
            disabled={
              isSavingCompany ||
              !companyChanges?.quickbooks?.settings?.qb_income_account_id
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

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
import { Card } from '$app/components/cards';
import { Modal } from '$app/components/Modal';
import { TabGroup } from '$app/components/TabGroup';
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
import { QuickbooksConnectTab } from './QuickbooksConnectTab';
import { QuickbooksImportTab } from './QuickbooksImportTab';
import { QuickbooksSyncTab } from './QuickbooksSyncTab';
import { ConnectedDots } from '$app/components/icons/ConnectedDots';
import { ArrowRight } from '$app/components/icons/ArrowRight';
import styled from 'styled-components';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function Quickbooks() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const companyChanges = useInjectCompanyChanges();

  const handleChange = useHandleCurrentCompanyChangeProperty();
  const { quickbooks, isConnected } = useQuickbooksConnection();
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

  const [isDisconnectModalVisible, setIsDisconnectModalVisible] =
    useState<boolean>(false);

  const isFormBusy = isConnectBusy || isDisconnectBusy;

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

  return (
    <>
      {isConnected && quickbooks ? (
        <Card
          title="QuickBooks"
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
          withoutBodyPadding
        >
          <TabGroup
            tabs={[t('connect'), t('import'), t('sync') || 'Sync']}
            withHorizontalPadding
            fullRightPadding
            horizontalPaddingWidth="1.5rem"
          >
            <QuickbooksConnectTab
              quickbooks={quickbooks}
              quickbooksSettings={quickbooksSettings}
              onDisconnectClick={() => setIsDisconnectModalVisible(true)}
              onIncomeAccountIdChange={handleIncomeAccountIdChange}
              isFormBusy={isFormBusy}
              errors={errors}
            />

            <QuickbooksImportTab
              syncSelections={syncSelections}
              onSyncSelectionChange={setSyncSelection}
              onSync={handleInitialSync}
              isSyncBusy={isSyncBusy}
              hasSyncSelection={hasSyncSelection}
            />

            {quickbooksSettings ? (
              <QuickbooksSyncTab
                quickbooksSettings={quickbooksSettings}
                onSyncDirectionChange={handleSyncDirectionChange}
              />
            ) : (
              <div />
            )}
          </TabGroup>
        </Card>
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
              Quickbooks
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
        title={t('initial_sync')}
        visible={isSyncInfoModalVisible}
        onClose={() => setIsSyncInfoModalVisible(false)}
      >
        <div className="flex flex-col space-y-4">
          <div
            className="text-sm whitespace-pre-line"
            style={{ color: colors.$3 }}
          >
            {t('quickbooks_sync_info')}
          </div>

          <div className="flex justify-end">
            <Button
              type="secondary"
              behavior="button"
              onClick={() => setIsSyncInfoModalVisible(false)}
            >
              {t('close')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        title={t('disconnect')}
        visible={isDisconnectModalVisible}
        onClose={() => setIsDisconnectModalVisible(false)}
      >
        <div className="flex flex-col space-y-4">
          <p className="text-sm" style={{ color: colors.$3 }}>
            {t('are_you_sure')}
          </p>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              type="secondary"
              behavior="button"
              onClick={() => setIsDisconnectModalVisible(false)}
            >
              {t('cancel')}
            </Button>

            <Button
              type="primary"
              behavior="button"
              onClick={() => {
                setIsDisconnectModalVisible(false);
                handleDisconnect();
              }}
              disabled={isFormBusy}
              className="bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
            >
              {t('disconnect')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

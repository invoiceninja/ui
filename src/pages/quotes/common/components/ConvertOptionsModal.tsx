/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Quote } from '$app/common/interfaces/quote';
import { CloneOption } from '$app/components/CloneOption';
import { EntityActionElement } from '$app/components/EntityActionElement';
import { Modal } from '$app/components/Modal';
import { Invoice as InvoiceIcon } from '$app/components/icons/Invoice';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSwitchRight } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { useBulkAction } from '../hooks/useBulkAction';
import { Button } from '$app/components/forms';
import { SuitCase } from '$app/components/icons/SuitCase';
import { QuoteStatus } from '$app/common/enums/quote-status';

interface Props {
  quote: Quote;
  dropdown: boolean;
}

export function ConvertOptionsModal({ quote, dropdown }: Props) {
  const [t] = useTranslation();

  const bulk = useBulkAction();
  const hasPermission = useHasPermission();

  const colors = useColorScheme();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isProjectModalVisible, setIsProjectModalVisible] =
    useState<boolean>(false);

  return (
    <>
      {((hasPermission('create_invoice') &&
        quote.status_id !== QuoteStatus.Converted) ||
        (hasPermission('create_project') && !quote.project_id)) && (
        <EntityActionElement
          entity="quote"
          actionKey="convert_to"
          isCommonActionSection={!dropdown}
          tooltipText={t('convert_to')}
          onClick={() => setIsModalVisible(true)}
          icon={MdSwitchRight}
          disablePreventNavigation
        >
          {t('convert_to')}
        </EntityActionElement>
      )}

      <Modal
        title={t('convert_to')}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      >
        <div className="flex justify-center">
          <div className="flex flex-1 flex-col items-center space-y-3">
            {hasPermission('create_invoice') &&
            quote.status_id !== QuoteStatus.Converted ? (
              <CloneOption
                label={t('invoice')}
                iconElement={<InvoiceIcon size="1.1rem" color={colors.$3} />}
                onClick={() => {
                  bulk([quote.id], 'convert_to_invoice');

                  setIsModalVisible(false);
                }}
              />
            ) : null}

            {hasPermission('create_project') && !quote.project_id ? (
              <CloneOption
                label={t('project')}
                iconElement={<SuitCase size="1.1rem" color={colors.$3} />}
                onClick={() => {
                  setIsModalVisible(false);

                  setTimeout(() => {
                    setIsProjectModalVisible(true);
                  }, 200);
                }}
              />
            ) : null}
          </div>
        </div>
      </Modal>

      <Modal
        title={t('are_you_sure')}
        visible={isProjectModalVisible}
        onClose={() => setIsProjectModalVisible(false)}
      >
        <Button
          behavior="button"
          onClick={() => {
            bulk([quote.id], 'convert_to_project');

            setIsProjectModalVisible(false);
          }}
        >
          {t('continue')}
        </Button>
      </Modal>
    </>
  );
}

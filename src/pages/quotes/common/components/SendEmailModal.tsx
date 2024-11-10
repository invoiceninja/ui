/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { trans } from '$app/common/helpers';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useBulkAction } from '../hooks/useBulkAction';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  quoteIds: string[];
  setSelected: (id: string[]) => void;
}

export type EmailType =
  | 'quote'
  | 'reminder1'
  | 'custom1'
  | 'custom2'
  | 'custom3';

interface Type {
  label: string;
  value: EmailType;
}

function useAvailableTypes() {
  const company = useCurrentCompany();

  const types: Type[] = [
    { label: 'initial_email', value: 'quote' },
    { label: 'reminder1', value: 'reminder1' },
  ];

  if (company?.settings.email_subject_custom1) {
    types.push({
      label: company?.settings.email_subject_custom1,
      value: 'custom1',
    });
  }

  if (company?.settings.email_subject_custom2) {
    types.push({
      label: company?.settings.email_subject_custom2,
      value: 'custom2',
    });
  }

  if (company?.settings.email_subject_custom3) {
    types.push({
      label: company?.settings.email_subject_custom3,
      value: 'custom3',
    });
  }

  return types;
}

const Div = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function SendEmailModal(props: Props) {
  const { visible, setVisible, quoteIds } = props;

  const [t] = useTranslation();

  const bulk = useBulkAction({ onSuccess: () => setVisible(false) });

  const colors = useColorScheme();
  const availableTypes = useAvailableTypes();

  return (
    <Modal
      title={trans('email_count_quotes', { count: quoteIds.length })}
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <div>
        {availableTypes.map((type, index) => (
          <Div
            key={index}
            className="flex justify-between py-2 cursor-pointer pl-2"
            onClick={() => {
              bulk(quoteIds, 'email', { email_type: type.value });
              props.setSelected([]);
            }}
            theme={{ hoverColor: colors.$5 }}
          >
            {t(type.label)}
          </Div>
        ))}
      </div>
    </Modal>
  );
}

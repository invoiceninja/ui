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
import { usePreventNavigation } from '$app/common/hooks/usePreventNavigation';
import { SearchRecord } from '$app/common/interfaces/search';
import { Entry } from '$app/components/forms/Combobox';
import { SetStateAction } from 'react';
import { Dispatch } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface Props {
  entry: Entry<SearchRecord>;
  index: number;
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  isContainerScrolling: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

const Div = styled.div`
  color: ${(props) => props.theme.color};
  background-color: ${(props) => props.theme.backgroundColor};
`;

export function SearchItem({
  entry,
  index,
  selectedIndex,
  setSelectedIndex,
  isContainerScrolling,
  setIsModalOpen,
}: Props) {
  const colors = useColorScheme();

  const navigate = useNavigate();
  const preventNavigation = usePreventNavigation();

  return (
    <Div
      key={entry.id}
      theme={{
        backgroundColor: index === selectedIndex ? colors.$5 : 'transparent',
        color: colors.$3,
      }}
      className="cursor-pointer py-2.5 font-medium active:font-semibold search-option text-sm px-4"
      onClick={() => {
        if (entry.resource) {
          preventNavigation({
            fn: () => {
              if (entry.resource) {
                navigate(entry.resource.path);
                setIsModalOpen(false);
              }
            },
          });
        }
      }}
      onMouseMove={() => {
        if (!isContainerScrolling && selectedIndex !== index) {
          setTimeout(() => setSelectedIndex(index), 20);
        }
      }}
      style={{
        borderRadius: '0.25rem',
      }}
    >
      <div>
        <p className="text-xs font-semibold">{entry.resource?.heading}</p>
        <p>{entry.label}</p>
      </div>
    </Div>
  );
}

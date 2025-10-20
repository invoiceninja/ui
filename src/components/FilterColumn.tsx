import { MdFilterList } from 'react-icons/md';
import { Icon } from './icons/Icon';
import { FilterOption } from './DataTable';
import { useEffect, useRef, useState } from 'react';
import { Button, Checkbox } from './forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { Popover } from 'antd';
import styled from 'styled-components';
import { useClickAway } from 'react-use';

interface Props {
  selectedValues: string[];
  options: FilterOption[];
  onChange: (value: string[]) => void;
}

const StyledDiv = styled.div`
  background-color: ${({ theme }) => theme.bgColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBgColor};
  }
`;

export const FilterColumn = ({ options, onChange, selectedValues }: Props) => {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const iconWrapperRef = useRef<HTMLDivElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  const handleCheckboxChange = (value: string) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleApply = () => {
    onChange(selected);
    setIsPopoverOpen(false);
  };

  const handleCancel = () => {
    if (selected.length) {
      setSelected([]);
      onChange([]);
    }

    setIsPopoverOpen(false);
  };

  useClickAway(popoverContentRef, (event) => {
    if (iconWrapperRef.current?.contains(event.target as Node)) {
      return;
    }
    setIsPopoverOpen(false);
  });

  useEffect(() => {
    setSelected(selectedValues);
  }, [selectedValues]);

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
      trigger={['click']}
      content={
        <div
          ref={popoverContentRef}
          className="w-48 flex flex-col space-y-4"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex flex-col max-h-52 overflow-y-auto pr-3">
            {options.map((option) => (
              <StyledDiv
                key={option.value}
                className="flex items-center cursor-pointer py-1.5 rounded px-2"
                onClick={() => handleCheckboxChange(option.value)}
                theme={{
                  bgColor: selected.some((item) => item === option.value)
                    ? colors.$4
                    : colors.$1,
                  hoverBgColor: colors.$4,
                }}
              >
                <Checkbox
                  checked={selected.some((item) => item === option.value)}
                  onValueChange={() => handleCheckboxChange(option.value)}
                />

                <span
                  className="ml-3 text-sm truncate"
                  style={{ color: colors.$3 }}
                >
                  {option.label}
                </span>
              </StyledDiv>
            ))}
          </div>

          <div className="flex justify-between space-x-2">
            <Button type="secondary" behavior="button" onClick={handleCancel}>
              {t('clear')}
            </Button>

            <Button behavior="button" onClick={handleApply}>
              {t('apply')}
            </Button>
          </div>
        </div>
      }
      arrow={false}
      placement="bottom"
    >
      <div
        ref={iconWrapperRef}
        className="cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Icon
          element={MdFilterList}
          color={selected.length ? '#22c55e' : colors.$17}
        />
      </div>
    </Popover>
  );
};

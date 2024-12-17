/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import { useBulkAction } from '../queries';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import { BiChevronUpSquare } from 'react-icons/bi';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { EntityActionElement } from '$app/components/EntityActionElement';

interface Props {
  selectedIds: string[];
  setSelected?: Dispatch<SetStateAction<string[]>>;
  dropdown: boolean;
}

export const IncreasePricesAction = (props: Props) => {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [increasingPercent, setIncreasingPercent] = useState<number>(0);

  const [errors, setErrors] = useState<ValidationBag>();

  const handleOnUpdatedPrices = () => {
    setIsModalOpen(false);
    setIncreasingPercent(0);
  };

  const bulk = useBulkAction({ onSuccess: handleOnUpdatedPrices, setErrors });

  const { selectedIds, setSelected, dropdown } = props;

  const handleSave = () => {
    bulk(selectedIds, 'increase_prices', {
      percentage_increase: increasingPercent,
    });

    setSelected?.([]);
  };

  return (
    <>
      <EntityActionElement
        entity="recurring_invoice"
        actionKey="increase_prices"
        isCommonActionSection={!dropdown}
        tooltipText={t('increase_prices')}
        onClick={() => setIsModalOpen(true)}
        icon={BiChevronUpSquare}
      >
        {t('increase_prices')}
      </EntityActionElement>

      <Modal
        title={t('increase_prices')}
        visible={isModalOpen}
        onClose={handleOnUpdatedPrices}
      >
        <NumberInputField
          label={t('percent')}
          value={increasingPercent || ''}
          onValueChange={(value) => {
            setIncreasingPercent(parseFloat(value));
            errors && setErrors(undefined);
          }}
          errorMessage={errors?.errors.percentage_increase}
        />

        <Button className="self-end" onClick={handleSave}>
          {t('submit')}
        </Button>
      </Modal>
    </>
  );
};

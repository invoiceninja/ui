/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCallback } from 'react';
import { TransactionInput } from 'common/interfaces/transactions';
import { TransactionValidation } from '../validation/ValidationInterface';

export const useTransactionValidation = () => {
  const checkValidation = useCallback((transaction?: TransactionInput) => {
    const {
      base_type,
      date,
      currency_id,
      bank_integration_id,
      description = '',
    } = transaction || {};

    if (!base_type) {
      return false;
    }
    if (!date) {
      return false;
    }
    if (!currency_id) {
      return false;
    }
    if (!bank_integration_id) {
      return false;
    }
    if (description?.length < 4) {
      return false;
    }
    return true;
  }, []);

  const setValidation = useCallback(
    (
      transaction?: TransactionInput,
      setErrors?: any,
      errors?: TransactionValidation
    ) => {
      const {
        base_type,
        date,
        currency_id,
        bank_integration_id,
        description = '',
      } = transaction || {};

      if (!base_type) {
        setErrors({
          ...errors,
          type: 'Type is required field',
        });
      }
      if (!date) {
        setErrors({
          ...errors,
          date: 'Date is required field',
        });
      }
      if (!currency_id) {
        setErrors({
          ...errors,
          currency: 'Currency is required field',
        });
      }
      if (!bank_integration_id) {
        setErrors({
          ...errors,
          bank_account: 'Bank account is required field',
        });
      }
      if (!description) {
        setErrors({
          ...errors,
          description: 'Description is required field',
        });
      } else {
        if (description?.length < 4) {
          setErrors({
            ...errors,
            description: 'Description should be at least 4 characters long',
          });
        }
      }
    },
    []
  );

  return { checkValidation, setValidation };
};

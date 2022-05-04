/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Spinner } from 'components/Spinner';
import { useTranslation } from 'react-i18next';
import { Td, Tr } from '.';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  data?: any;
  showHelperPlaceholders?: boolean;
}

export function Tbody(props: Props) {
  const [t] = useTranslation();

  return (
    <tbody ref={props.innerRef}>
      {!props.data && props.showHelperPlaceholders && (
        <Tr>
          <Td colSpan={20}>
            <Spinner />
          </Td>
        </Tr>
      )}

      {props.data &&
        props.showHelperPlaceholders &&
        props.data.data.meta.pagination.total === 0 && (
          <Tr>
            <Td colSpan={20}>
              <p>{t('empty_table')}</p>
            </Td>
          </Tr>
        )}

      {props.children}
    </tbody>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { Spinner } from 'components/Spinner';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CardContainer } from '.';
import { Button } from '../forms';
import { Element } from 'components/cards/Element';

interface Props {
  children: ReactNode;
  title?: string;
  description?: string;
  withSaveButton?: boolean;
  onFormSubmit?: (event: React.FormEvent<HTMLFormElement>) => any;
  onSaveClick?: any;
  saveButtonLabel?: string;
  disableSubmitButton?: boolean;
  className?: string;
  withContainer?: boolean;
  style?: React.CSSProperties;
  withScrollableBody?: boolean;
  additionalAction?: ReactNode;
  isLoading?: boolean;
  withoutBodyPadding?: boolean;
}

export function Card(props: Props) {
  const [t] = useTranslation();

  return (
    <div
      className={classNames(
        `bg-white shadow overflow-hidden rounded ${props.className}`,
        { 'overflow-y-auto': props.withScrollableBody }
      )}
      style={props.style}
    >
      <form onSubmit={props.onFormSubmit}>
        {props.title && (
          <div
            className={classNames(
              'px-4 py-5 sm:px-6 border-b border-gray-200',
              { 'bg-white sticky top-0': props.withScrollableBody }
            )}
          >
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {props.title}
            </h3>
            {props.description && (
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {props.description}
              </p>
            )}
          </div>
        )}

        <div className={classNames({ 'py-4': !props.withoutBodyPadding })}>
          {props.isLoading && <Element leftSide={<Spinner />} />}

          {props.withContainer ? (
            <CardContainer>{props.children}</CardContainer>
          ) : (
            props.children
          )}
        </div>

        {(props.withSaveButton || props.additionalAction) && (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="sm:py-5 sm:px-6 flex justify-end space-x-4">
                {props.additionalAction}

                {props.withSaveButton && (
                  <Button
                    onClick={props.onSaveClick}
                    disabled={props.disableSubmitButton}
                  >
                    {props.saveButtonLabel ?? t('save')}
                  </Button>
                )}
              </div>
            </dl>
          </div>
        )}
      </form>
    </div>
  );
}

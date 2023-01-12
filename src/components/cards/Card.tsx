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
import { CSSProperties, FormEvent, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardContainer } from '.';
import { Button } from '../forms';
import { Element } from 'components/cards/Element';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Icon } from 'components/icons/Icon';
import { BiPlusCircle, BiSave } from 'react-icons/bi';

interface Props {
  children: ReactNode;
  title?: string | null;
  description?: string;
  withSaveButton?: boolean;
  withCreateOption?: boolean;
  onFormSubmit?: (event: FormEvent<HTMLFormElement>) => unknown;
  onSaveClick?: (event: FormEvent<HTMLFormElement>) => unknown;
  onCreateClick?: (event: FormEvent<HTMLFormElement>) => unknown;
  saveButtonLabel?: string | null;
  createButtonLabel?: string | null;
  disableSubmitButton?: boolean;
  disableWithoutIcon?: boolean;
  className?: string;
  withContainer?: boolean;
  style?: CSSProperties;
  withScrollableBody?: boolean;
  additionalAction?: ReactNode;
  isLoading?: boolean;
  withoutBodyPadding?: boolean;
  padding?: 'small' | 'regular';
}

export function Card(props: Props) {
  const [t] = useTranslation();

  const { padding = 'regular' } = props;

  const [isSaveButtonActive, setIsSaveButtonActive] = useState(true);

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
            className={classNames('border-b border-gray-200', {
              'bg-white sticky top-0': props.withScrollableBody,
              'px-4 py-3': padding == 'small',
              'px-4 sm:px-6 py-5': padding == 'regular',
            })}
          >
            <h3
              className={classNames('leading-6 font-medium text-gray-900', {
                'text-lg': padding == 'regular',
                'text-md': padding == 'small',
              })}
            >
              {props.title}
            </h3>
            {props.description && (
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {props.description}
              </p>
            )}
          </div>
        )}

        <div
          className={classNames({
            'py-0': props.withoutBodyPadding,
            'py-4': padding == 'regular',
            'py-2': padding == 'small',
          })}
        >
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

                {props.withSaveButton && !props.withCreateOption && (
                  <Button
                    onClick={props.onSaveClick}
                    disabled={props.disableSubmitButton}
                    disableWithoutIcon={props.disableWithoutIcon}
                  >
                    {props.saveButtonLabel ?? t('save')}
                  </Button>
                )}

                {props.withSaveButton && props.withCreateOption && (
                  <div className="flex">
                    {isSaveButtonActive ? (
                      <Button
                        className="rounded-br-none rounded-tr-none pl-3 pr-2"
                        onClick={props.onSaveClick}
                        disabled={props.disableSubmitButton}
                        disableWithoutIcon={props.disableWithoutIcon}
                      >
                        {props.saveButtonLabel ?? t('save')}
                      </Button>
                    ) : (
                      <Button
                        className="rounded-br-none rounded-tr-none pl-3 pr-2"
                        onClick={props.onCreateClick}
                        disabled={props.disableSubmitButton}
                        disableWithoutIcon={props.disableWithoutIcon}
                      >
                        {props.createButtonLabel ?? t('create')}
                      </Button>
                    )}

                    <Dropdown
                      className="rounded-bl-none rounded-tl-none h-full px-1"
                      cardActions
                      disabled={props.disableSubmitButton}
                    >
                      <div>
                        {!isSaveButtonActive && (
                          <DropdownElement
                            icon={<Icon element={BiSave} />}
                            onClick={() => setIsSaveButtonActive(true)}
                          >
                            {props.saveButtonLabel ?? t('save')}
                          </DropdownElement>
                        )}
                      </div>

                      <div>
                        {isSaveButtonActive && (
                          <DropdownElement
                            icon={<Icon element={BiPlusCircle} />}
                            onClick={() => setIsSaveButtonActive(false)}
                          >
                            {props.createButtonLabel ?? t('create')}
                          </DropdownElement>
                        )}
                      </div>
                    </Dropdown>
                  </div>
                )}
              </div>
            </dl>
          </div>
        )}
      </form>
    </div>
  );
}

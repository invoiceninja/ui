/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { InputField, SelectField } from '../forms';
import { useTranslation } from 'react-i18next';
import { Element } from '../cards';
import { Icon } from '../icons/Icon';
import { MdAdd, MdDelete } from 'react-icons/md';
import { SearchableSelect } from '../SearchableSelect';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import RandExp from 'randexp';
import { cloneDeep, flatMapDeep, get, isObject, keys, set } from 'lodash';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { EInvoiceComponent, EInvoiceType } from '$app/pages/settings';
import { Spinner } from '../Spinner';
import Toggle from '../forms/Toggle';
import { EInvoiceBreadcrumbs } from './EInvoiceBreadcrumbs';
import { EInvoiceFieldCheckbox } from './EInvoiceFieldCheckbox';
import { EInvoiceValidationAlert } from './EInvoiceValidationAlert';
import { useLocation } from 'react-router-dom';
import { Invoice } from '$app/common/interfaces/invoice';
import { useColorScheme } from '$app/common/colors';
import { NumberInputField } from '../forms/NumberInputField';

export type Country = 'italy';

export type Payload = Record<string, string | number | boolean>;

interface AvailableGroup {
  key: string;
  label: string;
  multiSelection: boolean;
}

interface Resource {
  rules: Rule[];
  validations: Validation[];
  defaultFields: Record<string, string>;
  components: Record<string, Component | undefined>;
  excluded: string[];
}

interface Rule {
  key: string;
  label: string;
  type: 'dropdown';
  resource: string;
  required: boolean;
}

interface Validation {
  name: string;
  base_type: 'string' | 'decimal' | 'number' | 'date';
  resource: Record<string, string> | [];
  length: number | null;
  fraction_digits: number | null;
  total_digits: number | null;
  max_exclusive: number | null;
  min_exclusive: number | null;
  max_inclusive: number | null;
  min_inclusive: number | null;
  max_length: number | null;
  min_length: number | null;
  pattern: string | null;
  whitespace: boolean | null;
}

type Visibility = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ElementType {
  name: string;
  base_type:
    | ('string' | 'decimal' | 'number' | 'date' | 'boolean' | 'time')
    | null;
  resource: Record<string, string> | [];
  length: number | null;
  max_length: number | null;
  min_length: number | null;
  pattern: string | null;
  help: string;
  min_occurs: number;
  max_occurs: number;
  visibility: Visibility;
}

interface Component {
  type: string;
  help: string;
  choices: string[][] | undefined;
  elements: Record<string, ElementType>;
  visibility: Visibility;
}

interface Props {
  standard?: 'peppol';
  entityLevel?: boolean;
  currentEInvoice: EInvoiceType;
  invoice?: Invoice;
  setInvoice?: Dispatch<SetStateAction<Invoice | undefined>>;
}

interface ContainerProps {
  renderFragment: boolean;
  children: ReactNode;
  className: string;
}

export type EInvoiceUIComponents = JSX.Element | (JSX.Element | undefined)[];

function Container(props: ContainerProps) {
  const { renderFragment, children, className } = props;

  if (renderFragment) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return <div className={className}>{children}</div>;
}

export const EInvoiceGenerator = forwardRef<EInvoiceComponent, Props>(
  (props, ref) => {
    const [t] = useTranslation();

    const location = useLocation();

    const colors = useColorScheme();

    const {
      standard = 'peppol',
      entityLevel,
      currentEInvoice,
      invoice,
      setInvoice,
    } = props;

    const { isCompanySettingsActive, isClientSettingsActive } =
      useCurrentSettingsLevel();

    const [rules, setRules] = useState<Rule[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isInitial, setIsInitial] = useState<boolean>(true);
    const [components, setComponents] = useState<
      Record<string, Component | undefined>
    >({});
    const [eInvoice, setEInvoice] = useState<EInvoiceUIComponents>();
    const [eInvoiceResolvedType, setEInvoiceResolvedType] =
      useState<EInvoiceUIComponents>();
    const [defaultFields, setDefaultFields] = useState<Record<string, string>>(
      {}
    );

    let availableGroups: AvailableGroup[] = [];

    const [payload, setPayload] = useState<Payload>({});
    const [currentAvailableGroups, setCurrentAvailableGroups] = useState<
      AvailableGroup[]
    >([]);
    const [selectedMultiSelectionGroups, setSelectedMultiSelectionGroups] =
      useState<AvailableGroup[]>([]);
    const [deletedMultiSelectionGroups, setDeletedMultiSelectionGroups] =
      useState<AvailableGroup[]>([]);
    const [allAvailableGroups, setAllAvailableGroups] = useState<
      AvailableGroup[]
    >([]);
    const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
    const [isEInvoiceGenerating, setIsEInvoiceGenerating] =
      useState<boolean>(false);
    const [resolvedComplexTypes, setResolvedComplexTypes] = useState<string[]>(
      []
    );

    const getComponentKey = (label: string | null) => {
      return label?.split('Type')[0];
    };

    const handleChange = (
      property: string,
      value: string | number | boolean
    ) => {
      setPayload((current) => ({ ...current, [property]: value }));
    };

    const isFieldChoice = (fieldKey: string) => {
      const keysLength = fieldKey.split('|').length;
      if (keysLength > 1) {
        const isFromMultiSelectionGroup = doesKeyContainsNumber(fieldKey);

        const parentComponentType =
          fieldKey.split('|')[keysLength - (isFromMultiSelectionGroup ? 4 : 2)];

        const fieldName = fieldKey.split('|')[keysLength - 1];

        const parentComponent = components[parentComponentType];

        if (parentComponent && fieldName) {
          return parentComponent?.choices?.some((choiceGroup) =>
            choiceGroup.some((choice) => choice === fieldName)
          );
        }
      }

      return false;
    };

    const isChoiceSelected = (fieldKey: string) => {
      return Boolean(
        selectedChoices.find((choiceKey) => choiceKey === fieldKey)
      );
    };

    const showField = (
      key: string,
      visibility: number,
      isChildOfFirstLevelComponent: boolean
    ) => {
      const isFieldVisible = checkElementVisibility(visibility);

      if (!isFieldVisible) {
        return false;
      }

      if (isFieldChoice(key)) {
        return isChoiceSelected(key);
      }

      if (isChildOfFirstLevelComponent) {
        return true;
      }

      const isFieldFromResolvedComplexType =
        doesKeyStartsWithAnyResolvedComplexType(key);

      const isFieldFromSelectedGroup = !doesKeyStartsWithAnyGroupType(key);
      const isFieldFromSelectedMultiSelectionGroup =
        doesKeyStartsWithAnyMultiSelectionGroupType(key);

      return (
        isFieldFromResolvedComplexType ||
        isFieldFromSelectedGroup ||
        isFieldFromSelectedMultiSelectionGroup
      );
    };

    const handleDeleteComponent = (
      componentKey: string,
      isMultiSelection: boolean
    ) => {
      const deletedComponent = allAvailableGroups.find(
        ({ key }) => key === componentKey
      );

      if (deletedComponent || isMultiSelection) {
        setSelectedChoices((currentChoices) =>
          currentChoices.filter(
            (choiceKey) => !choiceKey.startsWith(componentKey)
          )
        );

        const isMultiSelectionKey = doesKeyContainsNumber(componentKey);

        const updatedComponentKey = componentKey
          .split('|')
          .filter(
            (_, index) =>
              index !==
              componentKey.split('|').length - (isMultiSelectionKey ? 2 : 1)
          )
          .join('|');

        const updatedPayload = cloneDeep(payload);

        Object.keys(updatedPayload).forEach((key) => {
          if (key.startsWith(updatedComponentKey)) {
            delete updatedPayload[key];
          }
        });

        setPayload(updatedPayload);

        if (isMultiSelection) {
          const currentDeletedMultiSelectionGroup =
            selectedMultiSelectionGroups.find(
              (group) => group.key === componentKey
            );

          if (currentDeletedMultiSelectionGroup) {
            setDeletedMultiSelectionGroups((current) => [
              ...current,
              currentDeletedMultiSelectionGroup,
            ]);
          }
        } else {
          if (deletedComponent) {
            setCurrentAvailableGroups((current) => [
              ...current,
              deletedComponent,
            ]);
          }
        }
      }
    };

    const doesKeyStartsWithAnyGroupType = (
      currentKey: string,
      currentList?: AvailableGroup[]
    ) => {
      const currentTypesList =
        currentList ?? (isInitial ? availableGroups : allAvailableGroups);

      return currentTypesList.some((currentType) => {
        const typeKeysLength = currentType.key.split('|').length;
        const updatedCurrentType = currentType.key
          .split('|')
          .filter((_, index) => index !== typeKeysLength - 1)
          .join('|');

        return updatedCurrentType
          .split('|')
          .every((type, index) => type === currentKey.split('|')[index]);
      });
    };

    const doesKeyStartsWithAnyMultiSelectionGroupType = (
      currentKey: string
    ) => {
      return selectedMultiSelectionGroups.some((currentType) => {
        const typeKeysLength = currentType.key.split('|').length;
        const updatedCurrentType = currentType.key
          .split('|')
          .filter(
            (_, index) =>
              index !== typeKeysLength - 1 && index !== typeKeysLength - 2
          )
          .join('|');

        return updatedCurrentType
          .split('|')
          .every((type, index) => type === currentKey.split('|')[index]);
      });
    };

    const doesKeyStartsWithAnyResolvedComplexType = (currentKey: string) => {
      return resolvedComplexTypes.some((currentType) => {
        const typeKeysLength = currentType.split('|').length;
        const updatedCurrentType = currentType
          .split('|')
          .filter((_, index) => index !== typeKeysLength - 1)
          .join('|');

        return updatedCurrentType
          .split('|')
          .every((type, index) => type === currentKey.split('|')[index]);
      });
    };

    const getElementName = (name: string): string => {
      return name.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
    };

    const renderElement = (
      element: ElementType,
      parentsKey: string,
      isChildOfFirstLevelComponent: boolean
    ) => {
      let leftSideLabel = '';
      const fieldKey = `${parentsKey}|${element.name}`;

      const rule = rules.find((rule) => rule.key === element.name);

      if (rule) {
        leftSideLabel = rule.label;
      } else {
        leftSideLabel = getElementName(element.name);
      }

      const isOptionalElement = doesKeyStartsWithAnyGroupType(fieldKey);

      if (
        !showField(fieldKey, element.visibility, isChildOfFirstLevelComponent)
      ) {
        return null;
      }

      if (payload[fieldKey] === undefined) {
        const keysLength = fieldKey.split('|').length;

        const fieldPath = fieldKey
          .split('|')
          .filter((_, index) => index !== keysLength - 2)
          .join('|')
          .replaceAll('|', '.');

        const currentFieldValue = get(currentEInvoice, fieldPath);

        const defaultValue =
          element.base_type === 'boolean'
            ? false
            : element.base_type === 'decimal' || element.base_type === 'number'
            ? 0
            : '';

        if (
          ((currentFieldValue as string | number) ||
            defaultFields[fieldKey.split('|')[keysLength - 1]] ||
            !isOptionalElement) &&
          !isFieldChoice(fieldKey)
        ) {
          setPayload((current) => ({
            ...current,
            [fieldKey]:
              (currentFieldValue as string | number) ||
              defaultFields[fieldKey.split('|')[keysLength - 1]] ||
              defaultValue,
          }));
        }

        if (isFieldChoice(fieldKey)) {
          //do..
        }
      }

      if (
        typeof element.resource === 'object' &&
        element.resource !== null &&
        Object.keys(element.resource).length
      ) {
        return (
          <Element
            key={fieldKey}
            leftSide={
              <EInvoiceFieldCheckbox
                fieldKey={fieldKey}
                fieldType="string"
                payload={payload}
                setPayload={setPayload}
                label={leftSideLabel}
                helpLabel={element.help}
                isOptionalField={isOptionalElement}
                requiredField={Boolean(rule?.required)}
                invoice={invoice}
                setInvoice={setInvoice}
              />
            }
            noExternalPadding
          >
            <SelectField
              value={payload[fieldKey] || ''}
              onValueChange={(value) => handleChange(fieldKey, value)}
              disabled={payload[fieldKey] === undefined}
              withBlank
              //errorMessage={errors?.errors[fieldKey]}
            >
              {Object.entries(element.resource).map(([key, value]) => (
                <option key={key} value={key}>
                  {value || key}
                </option>
              ))}
            </SelectField>
          </Element>
        );
      }

      if (element.base_type === 'decimal' || element.base_type === 'number') {
        return (
          <Element
            key={fieldKey}
            leftSide={
              <EInvoiceFieldCheckbox
                fieldKey={fieldKey}
                fieldType="number"
                payload={payload}
                setPayload={setPayload}
                label={leftSideLabel}
                helpLabel={element.help}
                isOptionalField={isOptionalElement}
                requiredField={Boolean(rule?.required)}
                invoice={invoice}
                setInvoice={setInvoice}
              />
            }
            noExternalPadding
          >
            <NumberInputField
              value={payload[fieldKey] || 0}
              onValueChange={(value) =>
                handleChange(
                  fieldKey,
                  parseFloat(value).toFixed(value.split('.')?.[1]?.length)
                )
              }
              disabled={payload[fieldKey] === undefined}
              //errorMessage={errors?.errors[fieldKey]}
            />
          </Element>
        );
      }

      if (element.base_type === 'date') {
        return (
          <Element
            key={fieldKey}
            leftSide={
              <EInvoiceFieldCheckbox
                fieldKey={fieldKey}
                fieldType="date"
                payload={payload}
                setPayload={setPayload}
                label={leftSideLabel}
                helpLabel={element.help}
                isOptionalField={isOptionalElement}
                requiredField={Boolean(rule?.required)}
                invoice={invoice}
                setInvoice={setInvoice}
              />
            }
            noExternalPadding
          >
            <InputField
              type="date"
              value={payload[fieldKey] || ''}
              onValueChange={(value) => handleChange(fieldKey, value)}
              disabled={payload[fieldKey] === undefined}
              //errorMessage={errors?.errors[fieldKey]}
            />
          </Element>
        );
      }

      if (element.base_type === 'boolean') {
        return (
          <Element
            key={fieldKey}
            leftSide={
              <EInvoiceFieldCheckbox
                fieldKey={fieldKey}
                fieldType="boolean"
                payload={payload}
                setPayload={setPayload}
                label={leftSideLabel}
                helpLabel={element.help}
                isOptionalField={isOptionalElement}
                requiredField={Boolean(rule?.required)}
                invoice={invoice}
                setInvoice={setInvoice}
              />
            }
            noExternalPadding
          >
            <Toggle
              checked={Boolean(payload[fieldKey]) || false}
              onValueChange={(value) => handleChange(fieldKey, value)}
              disabled={payload[fieldKey] === undefined}
            />
          </Element>
        );
      }

      if (element.base_type === 'time') {
        return (
          <Element
            key={fieldKey}
            leftSide={
              <EInvoiceFieldCheckbox
                fieldKey={fieldKey}
                fieldType="time"
                payload={payload}
                setPayload={setPayload}
                label={leftSideLabel}
                helpLabel={element.help}
                isOptionalField={isOptionalElement}
                requiredField={Boolean(rule?.required)}
                invoice={invoice}
                setInvoice={setInvoice}
              />
            }
            noExternalPadding
          >
            <InputField
              type="time"
              value={payload[fieldKey] || ''}
              onValueChange={(value) => handleChange(fieldKey, value)}
              disabled={payload[fieldKey] === undefined}
              //errorMessage={errors?.errors[fieldKey]}
            />
          </Element>
        );
      }

      if (element.base_type !== null) {
        return (
          <Element
            key={fieldKey}
            leftSide={
              <EInvoiceFieldCheckbox
                fieldKey={fieldKey}
                fieldType={element.base_type}
                payload={payload}
                setPayload={setPayload}
                label={leftSideLabel}
                helpLabel={element.help}
                isOptionalField={isOptionalElement}
                requiredField={Boolean(rule?.required)}
                invoice={invoice}
                setInvoice={setInvoice}
              />
            }
            noExternalPadding
          >
            <InputField
              value={payload[fieldKey] || ''}
              onValueChange={(value) => handleChange(fieldKey, value)}
              disabled={payload[fieldKey] === undefined}
              //errorMessage={errors?.errors[fieldKey]}
            />
          </Element>
        );
      }

      return null;
    };

    const checkElementVisibility = (visibility: number) => {
      const isCompanyLevel =
        isCompanySettingsActive && location.pathname.startsWith('/settings');

      if (visibility === 0) {
        return false;
      }

      if (visibility === 1 && !isCompanyLevel) {
        return false;
      }

      if (visibility === 2 && !isClientSettingsActive) {
        return false;
      }

      if (visibility === 4 && !entityLevel) {
        return false;
      }

      if (visibility === 3 && !isClientSettingsActive && !isCompanyLevel) {
        return false;
      }

      if (visibility === 5 && !entityLevel && !isCompanyLevel) {
        return false;
      }

      if (visibility === 6 && !entityLevel && !isClientSettingsActive) {
        return false;
      }

      return true;
    };

    const getChoiceSelectorLabel = (componentKey: string) => {
      const keysLength = componentKey.split('|').length;

      let lastParentType = '';
      let lastParentName = '';

      if (keysLength > 2) {
        lastParentType = componentKey.split('|')[keysLength - 3];
        lastParentName = componentKey.split('|')[keysLength - 2];
      }

      if (keysLength > 3) {
        lastParentType = componentKey.split('|')[keysLength - 4];
      }

      if (keysLength > 2 || keysLength > 3) {
        return `${t('Choices')} (${getComponentKey(
          lastParentType
        )}, ${lastParentName})`;
      }

      if (keysLength > 1) {
        lastParentName = componentKey.split('|')[keysLength - 2];

        return `${t('Choices')} (${lastParentName})`;
      }

      return t('Choices');
    };

    const isAnyElementOfComponentVisible = (currentComponent: Component) => {
      return Object.values(currentComponent.elements).some((currentElement) =>
        checkElementVisibility(currentElement.visibility)
      );
    };

    const getDefaultChoiceSelectorValue = (componentKey: string) => {
      const selectedComponentChoice = selectedChoices.find((choiceKey) =>
        choiceKey.startsWith(componentKey)
      );

      if (selectedComponentChoice) {
        const choiceKeysLength = selectedComponentChoice.split('|').length;
        const choiceName =
          selectedComponentChoice.split('|')[choiceKeysLength - 1];

        return choiceName;
      }

      return '';
    };

    const renderComponentResourceField = (
      componentName: string,
      componentPath: string
    ) => {
      if (!Number.isNaN(Number(componentName))) {
        return null;
      }

      let componentElement = null;

      Object.values(components).forEach((component) => {
        if (component?.elements[componentName]) {
          componentElement = component?.elements[componentName];
        }
      });

      if (
        componentElement &&
        typeof (componentElement as ElementType).resource === 'object' &&
        !Array.isArray((componentElement as ElementType).resource) &&
        Object.keys((componentElement as ElementType).resource).length
      ) {
        const fieldName = Object.keys(
          (componentElement as ElementType).resource
        )[0];

        const fieldKey = `${componentPath}|${fieldName}`;

        return (
          <Element
            key={fieldKey}
            leftSide={
              <EInvoiceFieldCheckbox
                fieldKey={fieldKey}
                fieldType="string"
                payload={payload}
                setPayload={setPayload}
                label={fieldName}
                helpLabel=""
                isOptionalField={
                  (componentElement as ElementType).min_occurs === 0
                }
                requiredField={false}
                invoice={invoice}
                setInvoice={setInvoice}
              />
            }
            noExternalPadding
          >
            <SelectField
              value={payload[fieldKey] || ''}
              onValueChange={(value) => handleChange(fieldKey, value)}
              disabled={payload[fieldKey] === undefined}
              withBlank
            >
              {Object.entries(
                (
                  (componentElement as ElementType)
                    .resource as unknown as Record<string, string>
                )[fieldName]
              ).map(([key, value]) => (
                <option key={key} value={key}>
                  {value || key}
                </option>
              ))}
            </SelectField>
          </Element>
        );
      }

      return null;
    };

    const renderComponent = (
      component: Component,
      componentIndex: number,
      componentPath: string,
      isFirstLevelComponent: boolean,
      isResolvingComplexType: boolean,
      isComponentMultiSelectionComplexType: boolean
    ) => {
      const componentKey = `${componentPath}|${component.type}`;

      const componentName =
        componentPath.split('|')[componentPath.split('|').length - 1];

      const currentGroupsList = isInitial
        ? availableGroups
        : currentAvailableGroups;

      const isIncludedInAllGroups = allAvailableGroups.some(
        (currentType) => componentKey === currentType.key
      );

      const isSelectedAsMultiSelectionGroup = selectedMultiSelectionGroups.some(
        (currentType) => componentKey === currentType.key
      );

      const shouldBeRendered =
        (!currentGroupsList.some(
          (currentType) => componentKey === currentType.key
        ) &&
          isIncludedInAllGroups) ||
        isSelectedAsMultiSelectionGroup;

      return (
        <Container
          className="flex items-center space-x-4"
          key={componentKey}
          renderFragment={!shouldBeRendered}
        >
          <Container
            className="flex flex-1 flex-col"
            renderFragment={!shouldBeRendered}
          >
            {renderComponentResourceField(componentName, componentPath)}

            {(shouldBeRendered || isFirstLevelComponent) &&
              Boolean(component.choices?.length) && (
                <Element
                  key={`${componentKey}ChoiceSelector`}
                  leftSide={getChoiceSelectorLabel(componentKey)}
                  noExternalPadding
                >
                  <SelectField
                    value={getDefaultChoiceSelectorValue(componentKey)}
                    onValueChange={(value) => {
                      setSelectedChoices((current) => {
                        const updatedCurrentList = current.filter(
                          (choice) => !choice.startsWith(componentKey)
                        );

                        if (!value) {
                          const choiceFieldKey = current.find((choice) =>
                            choice.startsWith(componentKey)
                          );

                          if (choiceFieldKey) {
                            setPayload((currentPayload) => ({
                              ...currentPayload,
                              [choiceFieldKey]:
                                typeof currentPayload[choiceFieldKey] ===
                                'number'
                                  ? 0
                                  : typeof currentPayload[choiceFieldKey] ===
                                    'boolean'
                                  ? false
                                  : '',
                            }));
                          }
                        }

                        return [
                          ...updatedCurrentList,
                          ...(value ? [`${componentKey}|${value}`] : []),
                        ];
                      });
                    }}
                    withBlank
                  >
                    {component.choices?.map((choiceGroup) =>
                      choiceGroup.map((choice) => (
                        <option key={choice} value={choice}>
                          {choice}
                        </option>
                      ))
                    )}
                  </SelectField>
                </Element>
              )}

            {Boolean(Object.keys(component.elements).length) &&
              Object.values(component.elements).map((element) => {
                if (element.base_type?.endsWith('Type')) {
                  const componentsList = Object.values(components).filter(
                    (_, index) => componentIndex !== index
                  );

                  const nextComponentIndex = componentsList.findIndex(
                    (component) => component?.type === element.base_type
                  );

                  const nextComponent = componentsList[nextComponentIndex];

                  if (nextComponent) {
                    const isElementVisible = checkElementVisibility(
                      element.visibility
                    );

                    const componentKeyPath = `${componentPath}|${element.name}|${nextComponent.type}`;

                    const isAnyElementOfNewComponentVisible =
                      isAnyElementOfComponentVisible(nextComponent);

                    const currentTypesList = isInitial
                      ? availableGroups
                      : allAvailableGroups;

                    if (
                      element.min_occurs === 0 &&
                      isAnyElementOfNewComponentVisible &&
                      isElementVisible
                    ) {
                      const isAlreadyAdded = doesKeyStartsWithAnyGroupType(
                        componentKeyPath,
                        currentTypesList
                      );

                      if (!isAlreadyAdded) {
                        const keysLength = componentKeyPath.split('|').length;

                        const lastParentName =
                          componentKeyPath.split('|')[keysLength - 3];

                        const label = lastParentName
                          ? `${getElementName(element.name)} (${getElementName(
                              lastParentName
                            )})`
                          : getElementName(element.name);

                        availableGroups.push({
                          key: componentKeyPath,
                          label,
                          multiSelection: Boolean(element.max_occurs === -1),
                        });
                      }
                    }

                    const shouldResolvingComponentBeRenderedByParent =
                      doesKeyStartsWithAnyResolvedComplexType(componentKeyPath);

                    const isTypeFromSelectedGroup =
                      !doesKeyStartsWithAnyGroupType(
                        componentKeyPath,
                        currentAvailableGroups
                      );

                    const isTypeFromMultiSelectionGroup =
                      doesKeyStartsWithAnyMultiSelectionGroupType(
                        componentKeyPath
                      );

                    const isComplexTypeGroup = currentTypesList.find(
                      (group) => group.key === componentKeyPath
                    );

                    const shouldResolvingComponentBeRendered =
                      isElementVisible &&
                      ((isFirstLevelComponent && !isComplexTypeGroup) ||
                        isTypeFromSelectedGroup ||
                        isTypeFromMultiSelectionGroup ||
                        shouldResolvingComponentBeRenderedByParent);

                    const isMultiSelectionComplexType =
                      element.max_occurs === -1 &&
                      !isComponentMultiSelectionComplexType;

                    const complexTypesList = isMultiSelectionComplexType
                      ? selectedMultiSelectionGroups
                          .filter((group) => {
                            const groupKeysLength = group.key.split('|').length;
                            const updatedCurrentGroupKey = group.key
                              .split('|')
                              .filter(
                                (_, index) => index !== groupKeysLength - 1
                              )
                              .join('|');

                            return updatedCurrentGroupKey === componentKeyPath;
                          })
                          .map(() => element)
                      : [element];

                    return (
                      <>
                        {shouldResolvingComponentBeRendered &&
                          isAnyElementOfNewComponentVisible && (
                            <>
                              {complexTypesList.map(
                                (currentElement, index) =>
                                  (!deletedMultiSelectionGroups.some(
                                    (currentGroup) =>
                                      currentGroup.key ===
                                      `${componentKeyPath}|${index}`
                                  ) ||
                                    !isMultiSelectionComplexType) && (
                                    <div
                                      key={`${componentKeyPath}${index}`}
                                      className="flex items-center space-x-4 mt-1"
                                    >
                                      <div
                                        className="flex flex-1 items-center py-2 border-b border-t justify-between"
                                        style={{ borderColor: colors.$5 }}
                                      >
                                        <div className="flex flex-col space-y-1">
                                          <span className="text-sm">
                                            {complexTypesList.length === 1
                                              ? getElementName(
                                                  currentElement.name
                                                )
                                              : `${getElementName(
                                                  currentElement.name
                                                )} (${index + 1})`}
                                          </span>

                                          {currentElement.help && (
                                            <span className="text-xs">
                                              {currentElement.help}
                                            </span>
                                          )}
                                        </div>

                                        <div
                                          className="cursor-pointer"
                                          onClick={() =>
                                            setResolvedComplexTypes(
                                              (current) => [
                                                ...current,
                                                isMultiSelectionComplexType
                                                  ? `${componentKeyPath}|${index}`
                                                  : componentKeyPath,
                                              ]
                                            )
                                          }
                                        >
                                          <Icon element={MdAdd} size={27} />
                                        </div>
                                      </div>

                                      {isComplexTypeGroup && (
                                        <div
                                          className="cursor-pointer"
                                          onClick={() =>
                                            handleDeleteComponent(
                                              isMultiSelectionComplexType
                                                ? `${componentKeyPath}|${index}`
                                                : componentKeyPath,
                                              isMultiSelectionComplexType
                                            )
                                          }
                                        >
                                          <Icon element={MdDelete} size={28} />
                                        </div>
                                      )}
                                    </div>
                                  )
                              )}
                            </>
                          )}
                      </>
                    );
                  }
                } else {
                  return renderElement(
                    element,
                    componentKey,
                    isFirstLevelComponent
                  );
                }
              })}
          </Container>
        </Container>
      );
    };

    const updateErrors = (
      currentErrors: ValidationBag,
      key: string,
      value: string
    ) => {
      return {
        ...currentErrors,
        errors: {
          ...currentErrors.errors,
          [key]: [
            ...(currentErrors.errors[key] ? currentErrors.errors[key] : []),
            currentErrors.errors[key]?.length ? `\n ${value}` : value,
          ],
        },
      };
    };

    const doesKeyContainsNumber = (key: string) => {
      return /\d/.test(key);
    };

    const buildPaths = (currentEInvoice: EInvoiceType, path = ''): string[] => {
      return flatMapDeep(keys(currentEInvoice), (key) => {
        const value = currentEInvoice[key];
        const newPath = path ? `${path}.${key}` : key;
        if (isObject(value)) {
          return buildPaths(value, newPath);
        }
        return newPath;
      });
    };

    const generatePaths = (currentEInvoice: EInvoiceType, currentPath = '') => {
      return buildPaths(currentEInvoice, currentPath);
    };

    const checkValidation = () => {
      let updatedErrors: ValidationBag = { errors: {}, message: '' };

      Object.entries(payload).forEach(([key, value]) => {
        const isFromMultiSelectionGroup = doesKeyContainsNumber(key);

        const keysLength = key.split('|').length;
        const fieldKey = key.split('|')[keysLength - 1];
        const firstParentComponentType =
          key.split('|')[keysLength - (isFromMultiSelectionGroup ? 4 : 2)];

        let field: ElementType | undefined;

        Object.values(components).forEach((component) => {
          if (
            component &&
            !field &&
            firstParentComponentType === component.type
          ) {
            field = Object.values(component?.elements || {}).find(
              ({ name }) => name === fieldKey
            );
          }
        });

        if (field) {
          let fieldValidation: ElementType | undefined;

          Object.values(components).forEach((component) => {
            if (!fieldValidation) {
              fieldValidation = Object.values(component?.elements || {}).find(
                ({ name }) => name === fieldKey
              );
            }
          });

          const isRequired = rules.find(
            (rule) => rule.key === fieldKey
          )?.required;

          if (fieldValidation) {
            const { pattern, length, min_length, max_length } = fieldValidation;

            if (isRequired && !value) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `${key} is required field!`
              );
            }

            if (
              length &&
              (value?.toString().length < length ||
                value?.toString().length > length)
            ) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Value length for the ${fieldKey} field must be ${length}!`
              );
            }

            if (pattern) {
              try {
                const isPatternFailed =
                  new RegExp(pattern).test(value.toString()) === false;

                if (isPatternFailed) {
                  updatedErrors = updateErrors(
                    updatedErrors,
                    key,
                    `${fieldKey} has wrong pattern, the correct pattern is ${new RandExp(
                      pattern as string
                    ).gen()} (example)!`
                  );
                }
              } catch (error) {
                console.error(error);
              }
            }

            if (min_length && !max_length) {
              if (value?.toString().length < min_length) {
                updatedErrors = updateErrors(
                  updatedErrors,
                  key,
                  `Min length for ${fieldKey} field is ${min_length}!`
                );
              }
            }

            if (max_length && !min_length) {
              if (value?.toString().length > max_length) {
                updatedErrors = updateErrors(
                  updatedErrors,
                  key,
                  `Max length for ${fieldKey} field is ${max_length}!`
                );
              }
            }

            if (max_length && min_length) {
              if (
                (value?.toString().length > max_length ||
                  value?.toString().length < min_length) &&
                max_length !== min_length
              ) {
                updatedErrors = updateErrors(
                  updatedErrors,
                  key,
                  `Length for ${fieldKey} field should be between ${min_length} and ${max_length}!`
                );
              } else if (
                value?.toString().length > max_length ||
                value?.toString().length < min_length
              ) {
                updatedErrors = updateErrors(
                  updatedErrors,
                  key,
                  `Length for ${fieldKey} field should be ${min_length}!`
                );
              }
            }
          }
        }
      });

      if (Object.keys(updatedErrors.errors).length) {
        setErrors(updatedErrors);

        return updatedErrors;
      }

      setErrors(undefined);

      return undefined;
    };

    const formatPayload = () => {
      const formattedPayload = {};

      Object.entries(payload).forEach(([key, value]) => {
        const keysLength = key.split('|').length;
        const fieldKey = key.split('|')[keysLength - 1];
        const firstParentComponentType = key.split('|')[keysLength - 2];

        let field: ElementType | undefined;

        Object.values(components).forEach((component) => {
          if (
            component &&
            !field &&
            firstParentComponentType === component.type
          ) {
            field = Object.values(component?.elements || {}).find(
              ({ name }) => name === fieldKey
            );
          }
        });

        if (payload[key] !== undefined && payload[key] !== null) {
          const updatedPath = key
            .split('|')
            .filter((currentKey) => !currentKey.endsWith('Type'))
            .join('|');

          set(formattedPayload, updatedPath.replaceAll('|', '.'), value);
        }
      });

      return formattedPayload;
    };

    const getBreadcrumbsLabels = () => {
      return resolvedComplexTypes.map((currentComplexType) => {
        const componentTypeKeysLength = currentComplexType.split('|').length;
        const lastChar = currentComplexType.slice(-1);
        const isMultiSelectionComplexType = /\d/.test(lastChar);

        const currentLabel =
          currentComplexType.split('|')[
            componentTypeKeysLength - (isMultiSelectionComplexType ? 3 : 2)
          ];

        return isMultiSelectionComplexType
          ? `${currentLabel} (${Number(lastChar) + 1})`
          : currentLabel;
      });
    };

    const handleSave = () => {
      setErrors(undefined);

      const currentErrors = checkValidation();

      if (currentErrors === undefined) {
        return formatPayload();
      }
    };

    const generateEInvoiceUI = async (
      components: Record<string, Component | undefined>,
      firstLevelComponents?: boolean,
      preComponentPath?: string,
      isMultiSelectionComplexType?: boolean
    ) => {
      if (!Object.keys(components).length) {
        return <></>;
      }

      const invoiceComponents = Object.entries(components).map(
        ([componentName, component], index) => {
          const isAlreadyRendered = Object.values(components)
            .filter((_, currentIndex) => currentIndex < index)
            .some((currentComponent) =>
              Object.values(currentComponent?.elements || {}).some(
                (element) => element.base_type === component?.type
              )
            );
          const isIndividualComponent = !Object.values(components).some(
            (currentComponent) =>
              Object.values(currentComponent?.elements || {}).some(
                (element) => element.base_type === component?.type
              )
          );

          if (index === 0 || (!isAlreadyRendered && isIndividualComponent)) {
            return (
              component &&
              renderComponent(
                component,
                index,
                preComponentPath
                  ? preComponentPath
                  : getComponentKey(componentName) || '',
                firstLevelComponents ?? true,
                Boolean(preComponentPath),
                Boolean(isMultiSelectionComplexType)
              )
            );
          }
        }
      );

      return invoiceComponents.filter((currentComponent) => currentComponent);
    };

    useEffect(() => {
      if (standard) {
        fetch(
          new URL(
            `/src/resources/e-invoice/${standard}/${standard}.json`,
            import.meta.url
          ).href
        )
          .then((response) => response.json())
          .then((response: Resource) => {
            setIsInitial(true);
            setEInvoice(undefined);
            setRules(response.rules);
            setCurrentAvailableGroups([]);
            setAllAvailableGroups([]);
            setComponents(response.components);
            setDefaultFields(response.defaultFields);
            setErrors(undefined);
            setSelectedChoices([]);
            availableGroups = [];
          });
      } else {
        setRules([]);
        setComponents({});
        setErrors(undefined);
        setEInvoice(undefined);
        setIsInitial(true);
        setDefaultFields({});
        setCurrentAvailableGroups([]);
        setAllAvailableGroups([]);
        setSelectedChoices([]);
        availableGroups = [];
      }
    }, [standard]);

    useEffect(() => {
      if (Object.keys(components).length) {
        (async () => {
          setIsEInvoiceGenerating(true);

          const invoiceUI = await generateEInvoiceUI(components);

          isInitial && setIsInitial(false);

          setEInvoice(invoiceUI);

          if (isInitial) {
            setAllAvailableGroups([...availableGroups]);
            setCurrentAvailableGroups([...availableGroups]);
          }

          setIsEInvoiceGenerating(false);
        })();
      }
    }, [
      components,
      currentAvailableGroups,
      errors,
      payload,
      selectedChoices,
      resolvedComplexTypes,
      selectedMultiSelectionGroups,
      deletedMultiSelectionGroups,
    ]);

    useEffect(() => {
      if (Object.keys(components).length && resolvedComplexTypes.length) {
        (async () => {
          const eInvoiceResolvedTypeUI = (await Promise.all(
            resolvedComplexTypes.map(async (currentResolvedType) => {
              const lastChar = currentResolvedType.slice(-1);
              const isLastCharNumber = /\d/.test(lastChar);

              const isMultiSelectionComplexType =
                doesKeyContainsNumber(currentResolvedType);

              const componentTypeKeysLength =
                currentResolvedType.split('|').length;
              const componentType =
                currentResolvedType.split('|')[
                  componentTypeKeysLength - (isLastCharNumber ? 2 : 1)
                ];
              const componentForResolving = components[componentType];

              let componentPrePath = currentResolvedType
                .split('|')
                .filter(
                  (_, index) =>
                    index <
                    componentTypeKeysLength -
                      (isMultiSelectionComplexType ? 0 : 1)
                )
                .join('|');

              if (isMultiSelectionComplexType) {
                componentPrePath = componentPrePath
                  .split('|')
                  .filter((currentKey) => !currentKey.endsWith('Type'))
                  .join('|');
              }

              return await generateEInvoiceUI(
                {
                  [componentType]: componentForResolving,
                },
                false,
                componentPrePath,
                isMultiSelectionComplexType
              );
            })
          )) as EInvoiceUIComponents | undefined;

          setEInvoiceResolvedType(eInvoiceResolvedTypeUI);
        })();
      }
    }, [errors, payload, selectedChoices, resolvedComplexTypes]);

    useEffect(() => {
      if (!isInitial) {
        setErrors(undefined);
      }
    }, [
      payload,
      currentAvailableGroups,
      resolvedComplexTypes,
      selectedChoices,
      selectedMultiSelectionGroups,
    ]);

    useEffect(() => {
      if (currentEInvoice && currentAvailableGroups.length) {
        allAvailableGroups.forEach((currentGroup) => {
          const updatedGroupKey = currentGroup.key
            .split('|')
            .filter((currentKey) => !currentKey.endsWith('Type'))
            .join('|');

          const groupValue = get(
            currentEInvoice,
            updatedGroupKey.replaceAll('|', '.')
          );

          if (groupValue) {
            const currentEInvoicePaths = generatePaths(currentEInvoice);

            currentEInvoicePaths.forEach((currentPath: string) => {
              let updatedCurrentPath = currentPath.split('.').join('|');
              const keysLength = updatedCurrentPath.split('|').length;
              const preLastFieldKey =
                updatedCurrentPath.split('|')[keysLength - 2];
              const fieldParentName =
                updatedCurrentPath.split('|')[
                  keysLength - (/\d/.test(preLastFieldKey) ? 3 : 2)
                ];

              let firstFieldParentType = '';

              Object.values(components).forEach((component) => {
                if (component && !firstFieldParentType) {
                  const fieldParentElement = Object.values(
                    component.elements
                  ).find((element) => element.name === fieldParentName);

                  if (fieldParentElement) {
                    firstFieldParentType =
                      fieldParentElement.base_type as string;
                  }
                }
              });

              if (firstFieldParentType) {
                const currentKeys = updatedCurrentPath.split('|');

                updatedCurrentPath = [
                  ...currentKeys.slice(0, keysLength - 1),
                  firstFieldParentType,
                  ...currentKeys.slice(keysLength - 1),
                ].join('|');

                const propertyValue = get(currentEInvoice, currentPath);

                setPayload((currentPayload) => ({
                  ...currentPayload,
                  [updatedCurrentPath]: propertyValue as string | number,
                }));
              }
            });
          }

          if (groupValue) {
            if (!currentGroup.multiSelection) {
              setCurrentAvailableGroups((current) =>
                current.filter((group) => group.key !== currentGroup.key)
              );
            } else {
              if (Array.isArray(groupValue)) {
                groupValue.forEach((currentGroupValue, index) => {
                  const isAlreadyAddedInSelectedGroups =
                    selectedMultiSelectionGroups.some(
                      (currentType) =>
                        currentType.key === `${currentGroup.key}|${index}`
                    );

                  const isAlreadyAddedInDeletedGroups =
                    deletedMultiSelectionGroups.some(
                      (currentType) =>
                        currentType.key === `${currentGroup.key}|${index}`
                    );

                  if (!isAlreadyAddedInSelectedGroups) {
                    setSelectedMultiSelectionGroups((current) => [
                      ...current,
                      { ...currentGroup, key: `${currentGroup.key}|${index}` },
                    ]);
                  }

                  if (!isAlreadyAddedInDeletedGroups && !currentGroupValue) {
                    setDeletedMultiSelectionGroups((current) => [
                      ...current,
                      { ...currentGroup, key: `${currentGroup.key}|${index}` },
                    ]);
                  }
                });
              }
            }
          }
        });
      }
    }, [currentEInvoice, allAvailableGroups]);

    useImperativeHandle(
      ref,
      () => {
        return {
          saveEInvoice() {
            return handleSave();
          },
        };
      },
      [payload]
    );

    return (
      <div className="flex flex-col mt-5">
        <div className="flex px-6">
          {errors && <EInvoiceValidationAlert errors={errors} />}
        </div>

        <div>
          {!resolvedComplexTypes.length ? (
            <>
              {Boolean(eInvoice) && (
                <Element leftSide={t('fields')}>
                  <SearchableSelect
                    value=""
                    onValueChange={(value) => {
                      const currentGroup = allAvailableGroups.find(
                        (group) => group.key === value
                      );

                      if (currentGroup && currentGroup.multiSelection) {
                        const numberOfAlreadyAddedGroups =
                          selectedMultiSelectionGroups.filter((group) => {
                            const groupKeysLength = group.key.split('|').length;
                            const updatedCurrentGroupKey = group.key
                              .split('|')
                              .filter(
                                (_, index) => index !== groupKeysLength - 1
                              )
                              .join('|');

                            return updatedCurrentGroupKey === value;
                          }).length;

                        const groupWithSameKeyAlreadyDeleted =
                          deletedMultiSelectionGroups.find((currentGroup) =>
                            currentGroup.key.startsWith(value)
                          );

                        if (!groupWithSameKeyAlreadyDeleted) {
                          setSelectedMultiSelectionGroups((current) => [
                            ...current,
                            {
                              ...currentGroup,
                              key: `${currentGroup.key}|${numberOfAlreadyAddedGroups}`,
                            },
                          ]);
                        } else {
                          setDeletedMultiSelectionGroups((current) =>
                            current.filter(
                              (currentDeletedGroup) =>
                                currentDeletedGroup.key !==
                                groupWithSameKeyAlreadyDeleted.key
                            )
                          );
                        }
                      } else {
                        setCurrentAvailableGroups((current) =>
                          current.filter((type) => type.key !== value)
                        );
                      }
                    }}
                    clearAfterSelection
                  >
                    {currentAvailableGroups
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map(({ key, label }, index) => (
                        <option key={index} value={key}>
                          {label}
                        </option>
                      ))}
                  </SearchableSelect>
                </Element>
              )}

              {isEInvoiceGenerating ? (
                <Spinner />
              ) : (
                <div className="mt-4 px-6">{eInvoice ?? null}</div>
              )}
            </>
          ) : (
            <>
              {eInvoice && eInvoiceResolvedType && (
                <EInvoiceBreadcrumbs
                  resolvedTypes={[t('general'), ...getBreadcrumbsLabels()]}
                  resolvedUIComponents={[
                    eInvoice as unknown as JSX.Element,
                    ...(eInvoiceResolvedType as unknown as JSX.Element[]),
                  ]}
                  onBreadCrumbIndexChange={(index) =>
                    !index
                      ? setResolvedComplexTypes([])
                      : setResolvedComplexTypes((currentResolvedComplexTypes) =>
                          currentResolvedComplexTypes.filter(
                            (_, typeIndex) => typeIndex < index
                          )
                        )
                  }
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

import type { TFunction } from 'i18next';

interface PropertyLabelAlias {
  translationKey: string;
  defaultValue?: string;
}

const propertyLabelAliases: Record<string, PropertyLabelAlias> = {
  user_id: { translationKey: 'user' },
  shipping_country_id: { translationKey: 'shipping_country' },
  stock_notification: { translationKey: 'stock_notifications' },
  stock_notification_threshold: {
    translationKey: 'notification_threshold',
  },
  foreign_amount: {
    translationKey: 'foreign_amount',
    defaultValue: 'Foreign Amount',
  },
  tax_id: { translationKey: 'tax_category' },
  type_id: { translationKey: 'type' },
};

export function formatImportMappingLabel(
  mapping: string,
  translate: TFunction
) {
  const [entity, property] = mapping.split('.');
  const propertyLabelAlias = propertyLabelAliases[property];
  const propertyTranslationKey = propertyLabelAlias?.translationKey ?? property;
  const propertyLabel = propertyLabelAlias?.defaultValue
    ? translate(propertyTranslationKey, {
        defaultValue: propertyLabelAlias.defaultValue,
      })
    : translate(propertyTranslationKey);

  return `${translate(entity)} - ${propertyLabel}`;
}

export function resolveImportMappingHints(
  availableMappings: string[],
  hints: number[]
) {
  const mapping: Record<number, string> = {};

  hints.forEach((availableMappingIndex, columnIndex) => {
    mapping[columnIndex] = availableMappings[availableMappingIndex] ?? '';
  });

  return mapping;
}

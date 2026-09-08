import { ValidationBag } from '$app/common/interfaces/validation-bag';

export function extractValidationErrorMessage(
  validationBag?: ValidationBag | null,
  preferredField?: string
): string | null {
  if (!validationBag) {
    return null;
  }

  const preferredFieldMessage = preferredField
    ? validationBag.errors?.[preferredField]?.find((message) => message?.trim())
    : null;

  if (preferredFieldMessage) {
    return preferredFieldMessage;
  }

  const firstFieldMessage = Object.values(validationBag.errors ?? {})
    .flat()
    .find((message) => message?.trim());

  if (firstFieldMessage) {
    return firstFieldMessage;
  }

  return validationBag.message?.trim() || null;
}

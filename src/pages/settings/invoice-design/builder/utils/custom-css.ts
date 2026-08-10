/**
 * The API design contract stores custom CSS as a complete style fragment,
 * while the editor works with the CSS body only.
 */
const STYLE_ELEMENT_PATTERN =
  /^\s*<style(?:\s[^>]*)?>([\s\S]*)<\/style\s*>\s*$/i;

export function unwrapCustomCssFromApi(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  const match = value.match(STYLE_ELEMENT_PATTERN);

  return match ? match[1].trim() : value;
}

export function wrapCustomCssForApi(value: unknown): string {
  const css = unwrapCustomCssFromApi(value).trim();

  return css ? `<style>\n${css}\n</style>` : '';
}

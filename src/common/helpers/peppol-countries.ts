/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const PEPPOL_COUNTRIES = [
  '20',
  '40',
  '56',
  '208',
  '276',
  '352',
  '372',
  '442',
  '528',
  '578',
  '752',
  '826',
];

export const PEPPOL_CLASSIFICATIONS: Record<string, string[]> = {
    '840': ['business'],                          // US
    '124': ['business'],                          // CA
    '484': ['business'],                          // MX
    '36':  ['business', 'government'],            // AU
    '554': ['business', 'government'],            // NZ
    '756': ['business', 'government'],            // CH
    '352': ['business', 'government'],            // IS
    '438': ['business', 'government'],            // LI
    '578': ['business', 'government'],            // NO
    '20':  ['business', 'government'],            // AD
    '8':   ['business', 'government'],            // AL
    '40':  ['business', 'government'],            // AT
    '70':  ['business', 'government'],            // BA
    '56':  ['business', 'government'],            // BE
    '100': ['business', 'government'],            // BG
    '196': ['business', 'government'],            // CY
    '203': ['business', 'government'],            // CZ
    '276': ['business', 'government'],            // DE
    '208': ['business', 'government'],            // DK
    '233': ['business', 'government'],            // EE
    '724': ['business'],                          // ES
    '246': ['business', 'government'],            // FI
    '250': ['business', 'government'],            // FR
    '300': ['business', 'government'],            // GR
    '191': ['business', 'government'],            // HR
    '348': ['business', 'government'],            // HU
    '372': ['business', 'government'],            // IE
    '380': ['business', 'government', 'individual'], // IT
    '440': ['business', 'government'],            // LT
    '442': ['business', 'government'],            // LU
    '428': ['business', 'government'],            // LV
    '492': ['business', 'government'],            // MC
    '499': ['business', 'government'],            // ME
    '807': ['business', 'government'],            // MK
    '470': ['business', 'government'],            // MT
    '528': ['business', 'government'],            // NL
    '616': ['business', 'government'],            // PL
    '620': ['business', 'government'],            // PT
    '642': ['business', 'government'],            // RO
    '688': ['business', 'government'],            // RS
    '752': ['business', 'government'],            // SE
    '705': ['business', 'government'],            // SI
    '703': ['business', 'government'],            // SK
    '674': ['business', 'government'],            // SM
    '792': ['business', 'government'],            // TR
    '336': ['business', 'government'],            // VA
    '356': ['business'],                          // IN
    '392': ['business'],                          // JP
    '458': ['business'],                          // MY
    '702': ['business', 'government'],            // SG
    '826': ['business'],                          // GB
    '682': ['business'],                          // SA
  };
  
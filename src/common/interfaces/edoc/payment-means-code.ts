/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface CodeList {
    Identification: Identification;
    ColumnSet: ColumnSet;
    SimpleCodeList: SimpleCodeList;
}
export interface SimpleCodeList {
    Row: Row[];
}
export interface Row {
    Value: Value[];
}
export interface Value {
    SimpleValue: number | string | string;
}
export interface ColumnSet {
    Column: Column[];
    Key: Key;
}
export interface Key {
    ShortName: string;
    ColumnRef: string;
}
export interface Column {
    ShortName: string;
    Data: string;
}
export interface Identification {
    ShortName: string;
    LongName: string[];
    Version: string;
    CanonicalUri: string;
    CanonicalVersionUri: string;
    LocationUri: string;
    AlternateFormatLocationUri: string;
    Agency: Agency;
}
export interface Agency {
    LongName: string;
    Identifier: number;
}
/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface RootObject {
    CodeList: CodeList;
}
interface CodeList {
    Identification: Identification;
    ColumnSet: ColumnSet;
    SimpleCodeList: SimpleCodeList;
}
interface SimpleCodeList {
    Row: Row[];
}
interface Row {
    Value: Value[];
}
interface Value {
    SimpleValue: number | string | string;
}
interface ColumnSet {
    Column: Column[];
    Key: Key;
}
interface Key {
    ShortName: string;
    ColumnRef: string;
}
interface Column {
    ShortName: string;
    Data: string;
}
interface Identification {
    ShortName: string;
    LongName: string[];
    Version: string;
    CanonicalUri: string;
    CanonicalVersionUri: string;
    LocationUri: string;
    AlternateFormatLocationUri: string;
    Agency: Agency;
}
interface Agency {
    LongName: string;
    Identifier: number;
}
import { InvoiceSum } from './../../../src/common/helpers/invoices/invoice-sum';
import currencies from '../../helpers/data/currencies';
import { Number } from './../../../src/common/helpers/number';

describe('Test Access Currency Object', () => {

    test('access', () => {

        const usd_currency = currencies.filter(currency => currency.code == 'USD')[0];
        expect(usd_currency.id).toEqual("1");
        expect(usd_currency.precision).toEqual(2);
    })

})

describe('Test Number Formatting USD', () => {

    it('playground', async () => {

        const currency = currencies.filter(currency => currency.code == 'USD')[0];

        let formatValue = Number.numberFormat(10, currency);
        expect(formatValue).toEqual("10.00");

        formatValue = Number.numberFormat(100, currency);
        expect(formatValue).toEqual("100.00");

        formatValue = Number.numberFormat(100.52, currency);
        expect(formatValue).toEqual("100.52");

        formatValue = Number.numberFormat(1000.25, currency);
        expect(formatValue).toEqual("1,000.25");
    });

});


describe('Test Number Formatting EUR', () => {

    it('playground', async () => {

        const currency = currencies.filter(currency => currency.code == 'EUR')[0];

        let formatValue = Number.numberFormat(10, currency);
        expect(formatValue).toEqual("10,00");

        formatValue = Number.numberFormat(100, currency);
        expect(formatValue).toEqual("100,00");

        formatValue = Number.numberFormat(100.52, currency);
        expect(formatValue).toEqual("100,52");

        formatValue = Number.numberFormat(1000.25, currency);
        expect(formatValue).toEqual("1.000,25");
    });

});

describe('Test Number Formatting GBP', () => {

    it('playground', async () => {

        const currency = currencies.filter(currency => currency.code == 'GBP')[0];

        let formatValue = Number.numberFormat(10, currency);
        expect(formatValue).toEqual("10.00");

        formatValue = Number.numberFormat(100, currency);
        expect(formatValue).toEqual("100.00");

        formatValue = Number.numberFormat(100.52, currency);
        expect(formatValue).toEqual("100.52");

        formatValue = Number.numberFormat(1000.25, currency);
        expect(formatValue).toEqual("1,000.25");
    });

});

describe('Test Number Formatting JPY', () => {

    it('playground', async () => {

        const currency = currencies.filter(currency => currency.code == 'JPY')[0];

        let formatValue = Number.numberFormat(10, currency);
        expect(formatValue).toEqual("10");

        formatValue = Number.numberFormat(100, currency);
        expect(formatValue).toEqual("100");

        formatValue = Number.numberFormat(100.45, currency);
        expect(formatValue).toEqual("100");

        formatValue = Number.numberFormat(100.52, currency);
        expect(formatValue).toEqual("101");

        formatValue = Number.numberFormat(1000.25, currency);
        expect(formatValue).toEqual("1,000");
    });

});
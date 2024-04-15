/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface FatturaPA {
    DatiRicezione?: DatiRicezione
    DatiContratto?: DatiContratto
    DatiOrdineAcquisto?: DatiOrdineAcquisto
    DatiAnagraficiVettore?: DatiAnagraficiVettore
    RegimeFiscale: string
    TipoDocumento: string
    ModalitaPagamento: string
    CondizioniPagamento: string
}

export interface DatiRicezione {
    RiferimentoNumeroLinea: string
    IdDocumento: string
    Data: string
    NumItem: string
    CodiceCommessaConvenzione: string
    CodiceCUP: string
    CodiceCIG: string
}

export interface DatiContratto {
    RiferimentoNumeroLinea: string
    IdDocumento: string
    Data: string
    NumItem: string
    CodiceCommessaConvenzione: string
    CodiceCUP: string
    CodiceCIG: string
}

export interface DatiOrdineAcquisto {
    RiferimentoNumeroLinea: string
    IdDocumento: string
    Data: string
    NumItem: string
    CodiceCommessaConvenzione: string
    CodiceCUP: string
    CodiceCIG: string
}

export interface DatiAnagraficiVettore {
    IdFiscaleIVA: string
    CodiceFiscale: string
    Anagrafica: string
    DataOraConsegna: string
}

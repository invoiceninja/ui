/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

 import { Card, Element } from '@invoiceninja/cards';
 import { Button, InputField, SelectField } from '@invoiceninja/forms';
 import axios, { AxiosError } from 'axios';
 import { InvoiceStatus } from 'common/enums/invoice-status';
 import { endpoint } from 'common/helpers';
 import { Invoice } from 'common/interfaces/invoice';
 import { ValidationBag } from 'common/interfaces/validation-bag';
 import { defaultHeaders } from 'common/queries/common/headers';
 import { usePaymentQuery } from 'common/queries/payments';
 import { Alert } from 'components/Alert';
import Toggle from 'components/forms/Toggle';
 import { useFormik } from 'formik';
 import { useEffect, useState } from 'react';
 import toast from 'react-hot-toast';
 import { useTranslation } from 'react-i18next';
 import { useQueryClient } from 'react-query';
 import { generatePath, useParams } from 'react-router-dom';
 import { useAllInvoicesQuery } from '../common/helpers/invoices-query';
 
 export function Refund() {
     const queryClient=useQueryClient();
   const { id } = useParams();
   const [t] = useTranslation();
   const { data: payment } = usePaymentQuery({ id });
   const [allUserInvoices, setallUserInvoices] = useState<Invoice[]>([]);
   const [errors, setErrors] = useState<ValidationBag>();
   const [invoices, setinvoices] = useState<string[]>([]);
   const [email, setemail] = useState(false)
   const formik = useFormik({
     enableReinitialize: true,
     initialValues: {
         id:payment?.data.data.id,
         date:payment?.data.data.date,

       invoices: [],
     }
     , onSubmit: (values) => {
         const toastId = toast.loading(t('processing'));
         setErrors(undefined);
         axios
           .post(endpoint('/api/v1/payments/refund?&email_receipt=:email', {email }), values, {
             headers: defaultHeaders,
           })
           .then(() => {
             toast.success(t('updated_payment'), { id: toastId });
           })
           .catch((error: AxiosError) => {
             console.error(error);
             toast.error(t('error_title'), { id: toastId });
             if (error.response?.status === 422) {
               setErrors(error.response.data);
             }
           })
           .finally(() => {
             formik.setSubmitting(false);
             queryClient.invalidateQueries(
               generatePath(`/api/v1/payments/refund?&email_receipt=${email}`)
             );
           });
       },
 
 
   });
 
 
 
   
 
   useEffect(() => {
     invoices.map((invoiceId: string) => {
       const invoiceItem = payment?.data.data.invoices.find(
         (invoice: Invoice) => invoice.id == invoiceId
       );
       if (invoiceItem)
         formik.setFieldValue('invoices', [
           ...formik.values.invoices,
           {
             amount:
             invoiceItem?.paid_to_date > payment?.data.data.amount-payment?.data.data.refunded
             ? payment?.data.data.amount-payment?.data.data.refunded
             : invoiceItem?.paid_to_date,
             invoice_id: invoiceItem?.id,
             credit_id: '',
             id: '',
           },
         ]);
     });
   }, [invoices]);
 
   useEffect(() => {
     let total = 0;
     formik.values.invoices.map((invoice: any) => {
       total = total + Number(invoice.amount);
       setinvoices(
         invoices.filter((invoiceId: string) => invoiceId != invoice.invoice_id)
       );
     });
   }, [formik.values.invoices]);
 
   return (
     <Card title={t('apply_payment')}  disableSubmitButton={formik.isSubmitting}
     onFormSubmit={formik.handleSubmit}
     withSaveButton>
                       {console.log(payment?.data.data)}
{console.log("formik",formik.values)}
       <Element leftSide={t('number')}>
         <InputField value={payment?.data.data.number} />
       </Element>
       <Element leftSide={t('amount')}>
         <InputField disabled value={payment?.data.data.amount-payment?.data.data.refunded} />
       </Element>
       <Element leftSide={t('applied')}>
         <InputField disabled value={payment?.data.data.applied} />
       </Element>
       <Element leftSide={t('date')}>
<InputField type='date' value={formik.values.date} onChange={formik.handleChange} />
       </Element>
       {console.log(errors)}
       <Element leftSide={t('invoices')}>
                 <SelectField
                   value=""
                   onChange={(event: any) => {
                     if (
                       formik.values.invoices.filter(
                         (invoices: any) =>
                           invoices.invoice_id == event.target.value
                       ).length < 1
                     )
                       setinvoices([...invoices, event.target.value]);
                   }}
                 >
                   <option value="" disabled></option>
                   {payment?.data.data.invoices&&payment?.data.data.invoices.map((invoice: Invoice, index: number) => {
                     return (
                       <option key={index} value={invoice.id}>
                         {invoice.number}
                       </option>
                     );
                   })}
                 </SelectField>
                 {errors?.errors.invoices && (
               <Alert type="danger">{errors.errors.invoices}</Alert>
             )}
               </Element>
               {console.log(formik.values)}
               {payment?.data.data&&formik.values.invoices.map((invoiceitem: any, index: number) => {
                 const invoiceItem = payment?.data.data.invoices.find(
                   (invoice: Invoice) => invoice.id == invoiceitem.invoice_id
                 );
 console.log("item",invoiceItem)
 
                 if (invoiceItem)
                   return (
                     <Element key={index} leftSide={invoiceItem?.number}>
                       <InputField
                         id={`invoices[${index}].amount`}
                         value={
                            invoiceItem?.paid_to_date > payment?.data.data.amount-payment?.data.data.refunded
                             ? payment?.data.data.amount-payment?.data.data.refunded
                             : invoiceItem?.paid_to_date
                         }
                         onChange={formik.handleChange}
                       />
                       {errors?.errors[`invoices.${[index]}.invoice_id`] && (
                         <Alert type="danger">
                           {errors.errors[`invoices.${[index]}.invoice_id`]}
                         </Alert>
                       )}
                       <Button
                         behavior="button"
                         type="minimal"
                         onClick={() => {
                           formik.setFieldValue(
                             'invoices',
                             formik.values.invoices.filter(
                               (invoice: any) =>
                                 invoice.invoice_id != invoiceitem.invoice_id
                             )
                           );
                         }}
                       >
                         Remove
                       </Button>

                     </Element>
                   );
               })}
               <Element leftSide={t('send_email')}>
                   <Toggle checked={email}
                   onChange={()=>{setemail(!email)}}
                   />
               </Element>
     </Card>
   );
 }
 
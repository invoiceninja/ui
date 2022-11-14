import { endpoint } from "common/helpers";
import { request } from "common/helpers/request";
import { route } from "common/helpers/route";
import { toast } from "common/helpers/toast/toast";
import { RecurringExpense } from "common/interfaces/recurring-expenses";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";

export function useToggleStartStop() {
    const [t] = useTranslation();
    const queryClient = useQueryClient();

    return (expense: RecurringExpense, action: 'start' | 'stop') => {
        toast.processing();

        const url =
            action === 'start'
                ? `/api/v1/recurring_expenses/:id?start=true`
                : '/api/v1/recurring_expenses/:id?stop=true';
        console.log(action)

        request('PUT', endpoint(url, { id: expense.id }), expense)
            .then(() => {
                toast.success(
                    action === 'start'
                        ? t('started_recurring_expense')
                        : t('stopped_recurring_expense')
                );
            })
            .catch((error) => {
                console.error(error);

                toast.error();
            })
            .finally(() =>
        queryClient.invalidateQueries(
          route('/api/v1/recurring_expenses/:id', { id: expense.id })
        )
      );

    };
}
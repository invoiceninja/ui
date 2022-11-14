import { Guard } from "common/guards/Guard";
import { enabled } from "common/guards/guards/enabled";
import { permission } from "common/guards/guards/permission";
import { RecurringExpenses } from "./index/RecurringExpenses";
import { ModuleBitmask } from "pages/settings/account-management/component";
import { Route } from "react-router-dom";
import { Clone } from "pages/expenses/clone/Clone";
import { Documents } from "pages/expenses/documents/Documents";
import { Import } from "pages/expenses/import/Import";
import { Edit } from "./edit/Edit";
import { CloneRecurring } from "./clone/CloneRecurring";
import { Create } from "./create/Create";

export const recurringExpenseRoutes = (
  <Route path="recurring_expenses">
    <Route
      path=""
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.RecurringExpenses),
            () => permission('view_recurring_expense'),
          ]}
          component={<RecurringExpenses />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.RecurringExpenses),
            () => permission('create_recurring_expense') || permission('edit_recurring_expense'),
          ]}
          component={<Import />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.RecurringExpenses),
            () => permission('create_recurring_expense'),
          ]}
          component={<Create />}
        />
      }
    />
    <Route path=":id">
      <Route
        path="edit"
        element={
          <Guard
            guards={[
              () => enabled(ModuleBitmask.RecurringExpenses),
              () => permission('edit_recurring_expense'),
            ]}
            component={<Edit />}
          />
        }
      />
      <Route
        path="documents"
        element={
          <Guard
            guards={[
              () => enabled(ModuleBitmask.RecurringExpenses),
              () => permission('view_recurring_expense'),
            ]}
            component={<Documents />}
          />
        }
      />
      <Route
        path="recurring_clone"
        element={
          <Guard
            guards={[
              () => enabled(ModuleBitmask.RecurringExpenses),
              () => permission('view_recurring_expense'),
            ]}
            component={<CloneRecurring />}
          />
        }
      />
    </Route>
    <Route
      path="clone"
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.RecurringExpenses),
            () => permission('view_expense'),
          ]}
          component={<Clone />}
        />
      }
    />

  </Route >

)
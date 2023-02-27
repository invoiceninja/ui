describe('permissions: recurring expenses', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  it("can't view recurring expenses", () => {
    cy.login()
      .clearPermissions()
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('.flex-grow > .flex-1').should(
      'not.contain.text',
      'Recurring Expenses'
    );
  });

  it('can view recurring expenses', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_recurring_expense')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Recurring Expenses').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a recurring expense", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_recurring_expense')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Recurring Expenses').click();
    cy.get('a').contains('New Recurring Expense').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a recurring expense', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_recurring_expense')
      .setPermission('create_recurring_expense')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Recurring Expenses').click();
    cy.get('a').contains('New Recurring Expense').click();

    cy.assertNoPermissionNotVisible();
  });

  it.skip('can view assigned recurring expense without view_all or view_recurring_expense permission', () => {
    // Missing vendor.

    cy.login()
      .clearPermissions()
      .setPermission('create_recurring_expense')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Recurring Expenses').click();
    cy.get('a').contains('New Recurring Expense').click();

    cy.get('#headlessui-combobox-input-\\:rg\\:')
      .click()
      .get('[data-cy="dc-0"]')
      .click({ force: true });

    cy.wait(200);

    cy.get('button').contains('Save').click();

    cy.get('div').contains('Successfully created recurring expense');

    cy.url().should('include', '/edit');

    cy.assertNoPermissionNotVisible();
  });
});

export {};

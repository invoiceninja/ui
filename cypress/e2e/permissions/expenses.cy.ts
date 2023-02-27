describe('permissions: expenses', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  it("can't view expenses", () => {
    cy.login()
      .clearPermissions()
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('.flex-grow > .flex-1').should('not.contain.text', 'Expenses');
  });

  it('can view expenses', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_expense')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Expenses').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a expense", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_expense')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Expenses').click();
    cy.get('a').contains('Enter Expense').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a expense', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_expense')
      .setPermission('create_expense')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Expenses').click();
    cy.get('a').contains('Enter Expense').click();

    cy.assertNoPermissionNotVisible();
  });

  it.skip('can view assigned expense without view_all or view_expense permission', () => {
    // Missing vendor.

    cy.login()
      .clearPermissions()
      .setPermission('create_expense')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Expenses').click();
    cy.get('a').contains('Enter Expense').click();

    cy.get('#headlessui-combobox-input-\\:rg\\:')
      .click()
      .get('[data-cy="dc-0"]')
      .click({ force: true });

    cy.wait(200);

    cy.get('button').contains('Save').click();

    cy.get('div').contains('Successfully created expense');

    cy.url().should('include', '/edit');

    cy.assertNoPermissionNotVisible();
  });
});

export {};

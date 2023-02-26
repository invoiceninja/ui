describe('permissions: recurring invoices', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  it("can't view recurring invoices", () => {
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
      'Recurring Invoices'
    );
  });

  it('can view recurring invoices', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_recurring_invoice')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Recurring Invoices').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a recurring invoice", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_recurring_invoice')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Recurring Invoices').click();
    cy.get('a').contains('New Recurring Invoice').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a recurring invoice', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_recurring_invoice')
      .setPermission('create_recurring_invoice')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Recurring Invoices').click();
    cy.get('a').contains('New Recurring Invoice').click();

    cy.assertNoPermissionNotVisible();
  });

  it('can view assigned recurring invoice without view_all or view_recurring_invoice permission', () => {
    cy.login()
      .clearPermissions()
      .setPermission('create_recurring_invoice')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Recurring Invoices').click();
    cy.get('a').contains('New Recurring Invoice').click();

    cy.get('[data-cy="dc-0"]').click({ force: true });

    cy.wait(200);

    cy.get('button').contains('Save').click();

    cy.get('div').contains('Successfully created recurring invoice');

    cy.url().should('include', '/edit');

    cy.assertNoPermissionNotVisible();
  });
});

export {};

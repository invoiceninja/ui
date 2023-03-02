describe('permissions: invoices', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  it("can't view invoices", () => {
    cy.login()
      .clearPermissions()
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('.flex-grow > .flex-1').should('not.contain.text', 'Invoices');
  });

  it('can view invoices', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_invoice')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Invoices').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a invoice", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_invoice')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Invoices').click();
    cy.get('a').contains('New Invoice').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a invoice', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_invoice')
      .setPermission('create_invoice')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Invoice').click();
    cy.get('a').contains('New Invoice').click();

    cy.assertNoPermissionNotVisible();
  });

  it('can view assigned invoice without view_all or view_invoice permission', () => {
    cy.login()
      .clearPermissions()
      .setPermission('create_invoice')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Invoices').click();
    cy.get('a').contains('New Invoice').click();

    cy.get('[data-cy="dc-0"]').click({ force: true });

    cy.wait(200);

    cy.get('button').contains('Save').click();

    cy.get('div').contains('Successfully created invoice');

    cy.url().should('include', '/edit');

    cy.assertNoPermissionNotVisible();
  });
});

export {};

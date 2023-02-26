describe('permissions: purchase orders', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  it("can't view purchase orders", () => {
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
      'Purchase Orders'
    );
  });

  it('can view purchase orders', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_purchase_order')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Purchase Orders').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a purchase orders", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_purchase_order')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Purchase Orders').click();
    cy.get('a').contains('New Purchase Order').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a vendor', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_purchase_order')
      .setPermission('create_purchase_order')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Purchase Orders').click();
    cy.get('a').contains('New Purchase Order').click();

    cy.assertNoPermissionNotVisible();
  });

  it.skip('can view assigned vendor without view_all or view_purchase_order permission', () => {
    // Need a vendor in order to create this.
    // Perhaps we wanna seed it.
    // Or create it using Cypress.

    cy.login()
      .clearPermissions()
      .setPermission('create_purchase_order')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Purchase Orders').click();
    cy.get('a').contains('New Purchase Order').click();

    cy.get('#headlessui-combobox-input-\\:rg\\:')
      .click()
      .get('[data-cy="dc-0"]')
      .click({ force: true });

    cy.wait(200);

    cy.get('button').contains('Save').click();

    cy.get('div').contains('Successfully created vendor');

    cy.url().should('include', '/edit');

    cy.assertNoPermissionNotVisible();
  });
});

export {};

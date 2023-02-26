describe('permissions: vendors', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  it("can't view vendors", () => {
    cy.login()
      .clearPermissions()
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('.flex-grow > .flex-1').should('not.contain.text', 'Vendors');
  });

  it('can view vendors', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_vendor')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Vendors').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a vendor", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_vendor')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Vendors').click();
    cy.get('a').contains('New Vendor').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a vendor', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_vendor')
      .setPermission('create_vendor')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Vendors').click();
    cy.get('a').contains('New Vendor').click();

    cy.assertNoPermissionNotVisible();
  });

  it.skip('can view assigned vendor without view_all or view_vendor permission', () => {
    cy.login()
      .clearPermissions()
      .setPermission('create_vendor')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Vendors').click();
    cy.get('a').contains('New Vendor').click();

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

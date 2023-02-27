describe('permissions: payments', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  it("can't view payments", () => {
    cy.login()
      .clearPermissions()
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('.flex-grow > .flex-1').should('not.contain.text', 'Payments');
  });

  it('can view payments', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_payment')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Payments').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a payment", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_payment')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Payments').click();
    cy.get('a').contains('Enter Payment').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a payment', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_payment')
      .setPermission('create_payment')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Payments').click();
    cy.get('a').contains('Enter Payment').click();

    cy.assertNoPermissionNotVisible();
  });

  it('can view assigned payment without view_all or view_payment permission', () => {
    cy.login()
      .clearPermissions()
      .setPermission('create_payment')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Payments').click();
    cy.get('a').contains('Enter Payment').click();

    cy.get('#headlessui-combobox-input-\\:rg\\:')
      .click()
      .get('[data-cy="dc-0"]')
      .click({ force: true });

    cy.wait(200);

    cy.get('button').contains('Save').click();

    cy.get('div').contains('Successfully created payment');

    cy.url().should('include', '/edit');

    cy.assertNoPermissionNotVisible();
  });
});

export {};

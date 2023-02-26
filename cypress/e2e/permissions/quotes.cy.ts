describe('permissions: quotes', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  it("can't view quotes", () => {
    cy.login()
      .clearPermissions()
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('.flex-grow > .flex-1').should('not.contain.text', 'Quotes');
  });

  it('can view quotes', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_quote')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Quotes').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a quote", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_quote')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Quotes').click();
    cy.get('a').contains('New Quote').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a quote', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_quote')
      .setPermission('create_quote')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Quotes').click();
    cy.get('a').contains('New Quote').click();

    cy.assertNoPermissionNotVisible();
  });

  it('can view assigned quote without view_all or view_quote permission', () => {
    cy.login()
      .clearPermissions()
      .setPermission('create_quote')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Quotes').click();
    cy.get('a').contains('New Quote').click();

    cy.get('[data-cy="dc-0"]').click({ force: true });

    cy.wait(200);

    cy.get('button').contains('Save').click();

    cy.get('div').contains('Successfully created quote');

    cy.url().should('include', '/edit');

    cy.assertNoPermissionNotVisible();
  });
});

export {};

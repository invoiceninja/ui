describe('permissions: credits', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  it("can't view credits", () => {
    cy.login()
      .clearPermissions()
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('.flex-grow > .flex-1').should('not.contain.text', 'Credits');
  });

  it('can view credits', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_credit')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Credits').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a credit", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_credit')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Credits').click();
    cy.get('a').contains('Enter Credit').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a credit', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_credit')
      .setPermission('create_credit')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Credits').click();
    cy.get('a').contains('Enter Credit').click();

    cy.assertNoPermissionNotVisible();
  });

  it('can view assigned credit without view_all or view_credit permission', () => {
    cy.login()
      .clearPermissions()
      .setPermission('create_credit')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Credits').click();
    cy.get('a').contains('Enter Credit').click();

    cy.get('[data-cy="dc-0"]').click({ force: true });

    cy.wait(200);

    cy.get('button').contains('Save').click();

    cy.get('div').contains('Successfully created credit');

    cy.url().should('include', '/edit');

    cy.assertNoPermissionNotVisible();
  });
});

export {};

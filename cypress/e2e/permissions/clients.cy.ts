describe('permissions: clients', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  it("can't view clients", () => {
    cy.login()
      .clearPermissions()
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('.flex-grow > .flex-1').should('not.contain.text', 'Clients');
  });

  it('can view clients', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_client')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Clients').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a client", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_client')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Clients').click();
    cy.get('a').contains('New Client').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a client', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_client')
      .setPermission('create_client')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Clients').click();
    cy.get('a').contains('New Client').click();

    cy.assertNoPermissionNotVisible();
  });

  it('can view assigned client without view_all or view_client permission', () => {
    cy.login()
      .clearPermissions()
      .setPermission('create_client')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Clients').click();
    cy.get('a').contains('New Client').click();

    cy.get('#name').type('#1 Company');
    cy.get('#first_name_0').type('#1 First name');
    cy.get('#last_name_0').type('#1 Last name');
    cy.get('#email_0').type('first@example.com');

    cy.get('button').contains('Save').click();

    cy.get('div').contains('Successfully created client');

    cy.assertNoPermissionNotVisible();
  });
});

export {};

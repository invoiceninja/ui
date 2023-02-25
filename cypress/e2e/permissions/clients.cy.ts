describe('permissions: clients', () => {
  it('can view a clients', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_client')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a')
      .contains('Clients')
      .click()
      .get('span')
      .contains('Total results');
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
    cy.get('h1').contains("Sorry, you don't have the needed permissions");
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

    cy.get('h3').contains('Company Details').get('h3').contains('Contacts');
  });

  it('can view assigned client without view_all or view_client permission', () => {
    cy.login()
      .clearPermissions()
      .setPermission('create_client')
      .get('button')
      .contains('Save')
      .click()
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

    cy.get('a').contains('Clients').click();
    cy.get('a').contains('#1 Company').click();

    cy.get('dd')
      .contains('Details')
      .get('dd')
      .contains('Address')
      .get('dd')
      .contains('Contacts');
  });
});

export {};

describe('permissions: products', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  it("can't view products", () => {
    cy.login()
      .clearPermissions()
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('.flex-grow > .flex-1').should('not.contain.text', 'Products');
  });

  it('can view products', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_product')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Products').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a product", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_product')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Products').click();
    cy.get('a').contains('New Product').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a product', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_product')
      .setPermission('create_product')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Products').click();
    cy.get('a').contains('New Product').click();

    cy.assertNoPermissionNotVisible();
  });

  it('can view assigned product without view_all or view_product permission', () => {
    cy.login()
      .clearPermissions()
      .setPermission('create_product')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Products').click();
    cy.get('a').contains('New Product').click();

    cy.get('button').contains('Save').click();

    cy.get('div').contains('Successfully created product');

    cy.url().should('include', '/edit');

    cy.assertNoPermissionNotVisible();
  });
});

export {};

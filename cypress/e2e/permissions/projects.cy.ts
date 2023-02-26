describe('permissions: projects', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  it("can't view projects", () => {
    cy.login()
      .clearPermissions()
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('.flex-grow > .flex-1').should('not.contain.text', 'Projects');
  });

  it('can view projects', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_project')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Projects').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a project", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_project')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Projects').click();
    cy.get('a').contains('New Project').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a project', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_project')
      .setPermission('create_project')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Projects').click();
    cy.get('a').contains('New Project').click();

    cy.assertNoPermissionNotVisible();
  });

  it('can view assigned project without view_all or view_project permission', () => {
    cy.login()
      .clearPermissions()
      .setPermission('create_project')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Projects').click();
    cy.get('a').contains('New Project').click();

    cy.get('#headlessui-combobox-input-\\:rg\\:')
      .click()
      .get('[data-cy="dc-0"]')
      .click({ force: true });

    cy.wait(200);

    cy.get('button').contains('Save').click();

    cy.get('div').contains('Successfully created project');

    cy.url().should('include', '/edit');

    cy.assertNoPermissionNotVisible();
  });
});

export {};

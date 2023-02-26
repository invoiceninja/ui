describe('permissions: bank transactions', () => {
  it("can't view bank transactions", () => {
    cy.login()
      .clearPermissions()
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('.flex-grow > .flex-1').should('not.contain.text', 'Transactions');
  });

  it('can view bank transactions', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_bank_transaction')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Transactions').click();

    cy.assertNoPermissionNotVisible();
  });

  it("can't create a bank transaction", () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_bank_transaction')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Transactions').click();
    cy.get('a').contains('New Transaction').click();

    cy.assertNoPermissionIsVisible();
  });

  it('can create a bank transaction', () => {
    cy.login()
      .clearPermissions()
      .setPermission('view_bank_transaction')
      .setPermission('create_bank_transaction')
      .get('button')
      .contains('Save')
      .click()
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Transactions').click();
    cy.get('a').contains('New Transaction').click();

    cy.assertNoPermissionNotVisible();
  });

  it.skip('can view assigned bank transaction without view_all or view_bank_transaction permission', () => {
    // Blocker: Bank account

    cy.login()
      .clearPermissions()
      .setPermission('create_bank_transaction')
      .get('button')
      .contains('Save')
      .click()
      .wait(1000)
      .get('div')
      .contains('Successfully updated user');

    cy.login('permissions@example.com', 'password');

    cy.get('a').contains('Transactions').click();
    cy.get('a').contains('New Transaction').click();

    cy.get('#headlessui-combobox-input-\\:rg\\:')
      .click()
      .get('[data-cy="dc-0"]')
      .click({ force: true });

    cy.wait(200);

    cy.get('button').contains('Save').click();

    cy.get('div').contains('Successfully created transaction');

    cy.url().should('include', '/edit');

    cy.assertNoPermissionNotVisible();
  });
});

export {};

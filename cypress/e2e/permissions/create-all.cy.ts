describe('permissions: create_all', () => {
  before(() => {
    cy.log('Seeding & preparing for test.')
      .exec('cd ../invoiceninja && make prepare-for-cypress')
      .log('Seeding complete. Running tests.');
  });

  before(() => {
    cy.login()
      .clearPermissions()
      .setPermission('create_all')
      .get('button')
      .contains('Save')
      .click();
  });

  beforeEach(() => cy.login('permissions@example.com', 'password'));

  it('create a client', () => {
    cy.get('a').contains('Clients').click();
    cy.get('a').contains('New Client').click();

    cy.get('h3').contains('Company Details');
    cy.get('h3').contains('Contacts');
  });

  it('can create a product', () => {
    cy.get('a').contains('Products').click();
    cy.get('a').contains('New Product').click();

    cy.get('h3').contains('New Product');
  });

  it('can create an invoice', () => {
    cy.get('a').contains('Invoices').click();
    cy.get('a').contains('New Invoice').click();

    cy.get('a').contains('New Invoice');
  });

  it('can create a recurring invoice', () => {
    cy.get('a').contains('Recurring Invoices').click();
    cy.get('a').contains('New Recurring Invoice').click();

    cy.get('a').contains('New Recurring Invoice');
  });

  it('can create a payment', () => {
    cy.get('a').contains('Payments').click();
    cy.get('a').contains('Enter Payment').click();

    cy.get('h3').contains('Enter Payment');
  });

  it('can create an quote', () => {
    cy.get('a').contains('Quotes').click();
    cy.get('a').contains('New Quote').click();

    cy.get('a').contains('New Quote');
  });

  it('can create a credit', () => {
    cy.get('a').contains('Credits').click();
    cy.get('a').contains('Enter Credit').click();

    cy.get('a').contains('Enter Credit');
  });

  it('can create a project', () => {
    cy.get('a').contains('Projects').click();
    cy.get('a').contains('New Project').click();

    cy.get('h3').contains('New Project');
  });

  it('can create a task', () => {
    cy.get('a').contains('Tasks').click();
    cy.get('a').contains('New Task').click();

    cy.get('a').contains('New Task');
  });

  it('can create a vendor', () => {
    cy.get('a').contains('Vendors').click();
    cy.get('a').contains('New Vendor').click();

    cy.get('h3').contains('Details');
    cy.get('h3').contains('Contacts');
  });

  it('can create a purchase order', () => {
    cy.get('a').contains('Purchase Orders').click();
    cy.get('a').contains('New Purchase Order').click();

    cy.get('a').contains('New Purchase Order');
  });

  it('can create a expense', () => {
    cy.get('a').contains('Expenses').click();
    cy.get('a').contains('Enter Expense').click();

    cy.get('h3').contains('Details');
    cy.get('h3').contains('Notes');
  });

  it('can create a recurring expense', () => {
    cy.get('a').contains('Recurring Expenses').click();
    cy.get('a').contains('New Recurring Expense').click();

    cy.get('h3').contains('Details');
    cy.get('h3').contains('Notes');
  });

  it('can create a transaction', () => {
    cy.get('a').contains('Transactions').click();
    cy.get('a').contains('New Transaction').click();

    cy.get('h3').contains('New Transaction');
  });
});

export {};

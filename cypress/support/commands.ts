/// <reference types="cypress" />

Cypress.Commands.add('login', (email?: string, password?: string) => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();

  cy.visit('/login').contains('Login');
  cy.get('#email').type(email ?? 'small@example.com');
  cy.get('#password').type(password ?? 'password');
  cy.get('[type=submit]').click();
});

Cypress.Commands.add('logout', () => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
});

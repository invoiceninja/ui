/// <reference types="cypress" />

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    login(username?: string, password?: string): Chainable<any>;
    logout(): Chainable<any>;
  }
}

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

import { mount } from 'cypress/react18';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      login(username?: string, password?: string): Chainable;
      logout(): Chainable;
    }
  }
}

Cypress.Commands.add('mount', mount);

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

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(username?: string, password?: string): Chainable<any>;
    logout(): Chainable<any>;
  }
}

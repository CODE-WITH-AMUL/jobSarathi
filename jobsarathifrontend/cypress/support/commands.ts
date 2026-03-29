/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login as candidate
Cypress.Commands.add('loginAsCandidate', (email: string = 'candidate@example.com', password: string = 'password123') => {
  cy.contains('Login').click();
  cy.contains("I'm a Candidate").click();
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url({ timeout: 10000 }).should('include', '/candidate/dashboard');
});

// Custom command to login as company
Cypress.Commands.add('loginAsCompany', (email: string = 'company@example.com', password: string = 'password123') => {
  cy.contains('Login').click();
  cy.contains("I'm a Company").click();
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url({ timeout: 10000 }).should('include', '/company/dashboard');
});

// Custom command to register as candidate
Cypress.Commands.add('registerAsCandidate', (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => {
  cy.contains('Register').click();
  cy.contains("I'm a Candidate").click();
  cy.get('input[name="firstName"]').type(userData.firstName);
  cy.get('input[name="lastName"]').type(userData.lastName);
  cy.get('input[name="email"]').type(userData.email);
  cy.get('input[name="password"]').type(userData.password);
  cy.get('input[name="confirmPassword"]').type(userData.password);
  cy.get('button[type="submit"]').click();
});

// Custom command to register as company
Cypress.Commands.add('registerAsCompany', (userData: {
  companyName: string;
  email: string;
  password: string;
}) => {
  cy.contains('Register').click();
  cy.contains("I'm a Company").click();
  cy.get('input[name="companyName"]').type(userData.companyName);
  cy.get('input[name="email"]').type(userData.email);
  cy.get('input[name="password"]').type(userData.password);
  cy.get('input[name="confirmPassword"]').type(userData.password);
  cy.get('button[type="submit"]').click();
});

// Custom command to check for console errors
Cypress.Commands.add('shouldHaveNoConsoleErrors', () => {
  cy.window().then((win) => {
    cy.spy(win.console, 'error');
    cy.spy(win.console, 'warn');

    // Wait a bit for any async errors
    cy.wait(1000);

    // Check that no errors were logged
    cy.window().then((win) => {
      expect(win.console.error).not.to.be.called;
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsCandidate(email?: string, password?: string): Chainable<void>;
      loginAsCompany(email?: string, password?: string): Chainable<void>;
      registerAsCandidate(userData: { firstName: string; lastName: string; email: string; password: string }): Chainable<void>;
      registerAsCompany(userData: { companyName: string; email: string; password: string }): Chainable<void>;
      shouldHaveNoConsoleErrors(): Chainable<void>;
    }
  }
}
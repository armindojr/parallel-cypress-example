/// <reference types="cypress" />

describe('Search/Google', () => {
    it('Search in google engine', () => {
        cy.visit('https://www.google.com.br/');
        cy.get('input[type="text"]').type('Cypress{enter}');
        cy.get('a[href="https://www.cypress.io/"]').should('be.visible');
    });
});

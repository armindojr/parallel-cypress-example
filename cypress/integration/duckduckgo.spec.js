/// <reference types="cypress" />

describe('Search/DuckDuckGo', () => {
    it('Search in DuckDuckGo engine', () => {
        cy.visit('https://duckduckgo.com/');
        cy.get('#search_form_input_homepage').type('Cypress{enter}');
        cy.get('a[href="https://www.cypress.io/"]').should('be.visible');
    });
});

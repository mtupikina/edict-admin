/**
 * E2E: App shell — login page when not authenticated.
 */
describe('Edict Admin', () => {
  it('displays login page when not authenticated', () => {
    cy.visit('/');
    cy.contains('Edict Admin').should('be.visible');
    cy.contains('Login with Gmail').should('be.visible');
  });
});

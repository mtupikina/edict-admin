/**
 * E2E: Auth business logic — unauthenticated users are redirected to login;
 * protected routes require auth.
 */
describe('Auth', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('redirects to login when visiting /users without token', () => {
    cy.visit('/users');
    cy.url().should('include', '/');
    cy.contains('Login with Gmail').should('be.visible');
  });

  it('shows login page at / with title and login action', () => {
    cy.visit('/');
    cy.contains('Edict Admin').should('be.visible');
    cy.contains('Login with Gmail').should('be.visible');
    cy.get('button').contains('Login with Gmail').should('be.visible').click();
    // After click, app redirects to backend auth (cross-origin); do not assert same-origin url
  });
});

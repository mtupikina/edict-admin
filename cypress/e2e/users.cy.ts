/**
 * E2E: Users feature — list loads from API, create/edit/delete flows (API stubbed).
 */
describe('Users', () => {
  const token = 'test-jwt-token';
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('shows users list when authenticated and API returns data', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('edict_admin_token', token);
    });
    cy.intercept('GET', `${apiUrl}/users`, {
      statusCode: 200,
      body: [
        {
          _id: '1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@test.com',
          role: 'student',
          createdAt: '',
          updatedAt: '',
        },
      ],
    }).as('getUsers');
    cy.visit('/users');
    cy.wait('@getUsers');
    cy.contains('Jane').should('be.visible');
    cy.contains('Doe').should('be.visible');
    cy.contains('jane@test.com').should('be.visible');
  });

  it('redirects to login when API returns 401 on users list', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('edict_admin_token', token);
    });
    cy.intercept('GET', `${apiUrl}/users`, { statusCode: 401 }).as('getUsers');
    cy.visit('/users');
    cy.wait('@getUsers');
    cy.url().should('include', '/');
    cy.contains('Login with Gmail').should('be.visible');
  });

  it('Create User button opens dialog', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('edict_admin_token', token);
    });
    cy.intercept('GET', `${apiUrl}/users`, { statusCode: 200, body: [] }).as('getUsers');
    cy.visit('/users');
    cy.wait('@getUsers');
    cy.contains('button', 'Add User').click();
    cy.contains('Create User').should('be.visible'); // dialog header
    cy.get('input[id="firstName"]').should('be.visible');
    cy.get('input[id="email"]').should('be.visible');
  });
});

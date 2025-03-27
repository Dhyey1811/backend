describe('Employee Management E2E Test', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/graphql').as('graphql');
    cy.visit('/');
    cy.wait('@graphql');
  });

  it('should load home and navigate to create page', () => {
    cy.contains('Employee List', { timeout: 10000 }).should('exist');
    cy.contains('Create Employee').click();
    cy.url().should('include', '/create');
  });

  it('should fill form and create employee', () => {
    cy.visit('/create');

    cy.get('input[name="firstName"]').should('be.visible').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="age"]').type('35');
    cy.get('input[name="dateOfJoining"]').type('2023-01-01');

    // Title dropdown
    cy.get('#mui-component-select-title').click({ force: true });
    cy.get('ul[role="listbox"]').should('be.visible');
    cy.contains('li', 'Manager').click();

    // Department dropdown
    cy.get('#mui-component-select-department').click({ force: true });
    cy.get('ul[role="listbox"]').should('be.visible');
    cy.contains('li', 'HR').click();

    // Employee Type dropdown
    cy.get('#mui-component-select-employeeType').click({ force: true });
    cy.get('ul[role="listbox"]').should('be.visible');
    cy.contains('li', 'FullTime').click();

    // Current Status dropdown
    cy.get('#mui-component-select-currentStatus').click({ force: true });
    cy.get('ul[role="listbox"]').should('be.visible');
    cy.contains('li', 'Active').click();

    cy.contains('Add Employee').click();
    cy.wait('@graphql');
    cy.url().should('eq', 'http://localhost:3000/');
    cy.wait('@graphql');
  });

  it('should show newly added employee in the list', () => {
    cy.visit('/');
    cy.wait('@graphql');
    cy.get('table tbody', { timeout: 10000 }).should('exist');
    cy.contains('John', { timeout: 5000 }).should('exist');
    cy.contains('Doe').should('exist');
  });

  it('should navigate to detail page', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.contains('Info').click();
    });

    cy.contains('Employee Details').should('exist');
    cy.contains('Retirement Information').should('exist');
  });

  it('should update employee status to Inactive', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.contains('Update').click();
    });

    cy.url().should('include', '/update');

    // ✅ MUI-safe: Select 'Inactive' from 'Current Status' dropdown
    cy.contains('Current Status').parents('[class*=MuiFormControl]').within(() => {
      cy.get('[role="button"]').click({ force: true });
    });
    cy.get('ul[role="listbox"]').should('be.visible');
    cy.contains('li', 'Inactive').click();

    cy.contains('Update Employee').click();
    cy.wait('@graphql');
    cy.url().should('eq', 'http://localhost:3000/');
  });

  it('should delete the employee', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.contains('Delete').click();
    });

    cy.on('window:confirm', () => true); // Accept confirmation
    cy.wait('@graphql');
    cy.contains('John').should('not.exist');
  });
});

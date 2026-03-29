describe('Job Portal Authentication and Dashboard Flow', () => {
  beforeEach(() => {
    // Clear localStorage and visit landing page
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    cy.visit('/');
  });

  describe('Landing Page', () => {
    it('should display Get Started, Login, and Register buttons', () => {
      cy.contains('Get Started').should('be.visible');
      cy.contains('Login').should('be.visible');
      cy.contains('Register').should('be.visible');
    });

    it('should open account type modal when Get Started is clicked', () => {
      cy.contains('Get Started').click();
      cy.contains('Choose Account Type').should('be.visible');
      cy.contains("I'm a Candidate").should('be.visible');
      cy.contains("I'm a Company").should('be.visible');
    });

    it('should open account type modal when Login is clicked', () => {
      cy.contains('Login').click();
      cy.contains('Choose Account Type').should('be.visible');
    });

    it('should open account type modal when Register is clicked', () => {
      cy.contains('Register').click();
      cy.contains('Choose Account Type').should('be.visible');
    });
  });

  describe('Account Type Selection', () => {
    it('should open candidate login form when candidate is selected', () => {
      cy.contains('Get Started').click();
      cy.contains("I'm a Candidate").click();
      cy.contains('Login as Candidate').should('be.visible');
    });

    it('should open company login form when company is selected', () => {
      cy.contains('Get Started').click();
      cy.contains("I'm a Company").click();
      cy.contains('Login as Company').should('be.visible');
    });
  });

  describe('Authentication Flow - Candidate', () => {
    beforeEach(() => {
      cy.contains('Login').click();
      cy.contains("I'm a Candidate").click();
    });

    it('should show validation errors for empty fields', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('Email and password are required').should('be.visible');
    });

    it('should show validation errors for invalid login', () => {
      cy.get('input[name="email"]').type('invalid@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      // Check for API error message
      cy.contains(/Invalid credentials|An error occurred/i).should('be.visible');
    });

    it('should successfully login and redirect to candidate dashboard', () => {
      // Assuming we have test credentials
      cy.get('input[name="email"]').type('candidate@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Should redirect to candidate dashboard
      cy.url().should('include', '/candidate/dashboard');
      cy.contains('Dashboard').should('be.visible');
    });
  });

  describe('Authentication Flow - Company', () => {
    beforeEach(() => {
      cy.contains('Login').click();
      cy.contains("I'm a Company").click();
    });

    it('should show validation errors for empty fields', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('Email and password are required').should('be.visible');
    });

    it('should successfully login and redirect to company dashboard', () => {
      // Assuming we have test credentials
      cy.get('input[name="email"]').type('company@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Should redirect to company dashboard
      cy.url().should('include', '/company/dashboard');
      cy.contains('Dashboard').should('be.visible');
    });
  });

  describe('Registration Flow - Candidate', () => {
    beforeEach(() => {
      cy.contains('Register').click();
      cy.contains("I'm a Candidate").click();
    });

    it('should show validation errors for empty required fields', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('First name and last name are required').should('be.visible');
    });

    it('should show password mismatch error', () => {
      cy.get('input[name="firstName"]').type('John');
      cy.get('input[name="lastName"]').type('Doe');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('different');
      cy.get('button[type="submit"]').click();

      cy.contains('Passwords do not match').should('be.visible');
    });

    it('should successfully register and redirect to candidate dashboard', () => {
      cy.get('input[name="firstName"]').type('John');
      cy.get('input[name="lastName"]').type('Doe');
      cy.get('input[name="email"]').type('john.doe@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Should redirect to candidate dashboard
      cy.url().should('include', '/candidate/dashboard');
    });
  });

  describe('Registration Flow - Company', () => {
    beforeEach(() => {
      cy.contains('Register').click();
      cy.contains("I'm a Company").click();
    });

    it('should show validation errors for empty company name', () => {
      cy.get('input[name="email"]').type('company@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.contains('Company name is required').should('be.visible');
    });

    it('should successfully register and redirect to company dashboard', () => {
      cy.get('input[name="companyName"]').type('Test Company');
      cy.get('input[name="email"]').type('test.company@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Should redirect to company dashboard
      cy.url().should('include', '/company/dashboard');
    });
  });

  describe('Dashboard Access Control', () => {
    it('should redirect unauthenticated users from candidate dashboard', () => {
      cy.visit('/candidate/dashboard');
      // Should redirect to login or landing page
      cy.url().should('not.include', '/candidate/dashboard');
    });

    it('should redirect unauthenticated users from company dashboard', () => {
      cy.visit('/company/dashboard');
      // Should redirect to login or landing page
      cy.url().should('not.include', '/company/dashboard');
    });

    it('should allow authenticated candidate to access candidate dashboard', () => {
      // Login first
      cy.contains('Login').click();
      cy.contains("I'm a Candidate").click();
      cy.get('input[name="email"]').type('candidate@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Visit dashboard
      cy.visit('/candidate/dashboard');
      cy.contains('Dashboard').should('be.visible');
    });

    it('should allow authenticated company to access company dashboard', () => {
      // Login first
      cy.contains('Login').click();
      cy.contains("I'm a Company").click();
      cy.get('input[name="email"]').type('company@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Visit dashboard
      cy.visit('/company/dashboard');
      cy.contains('Dashboard').should('be.visible');
    });
  });

  describe('Error Handling and Console Monitoring', () => {
    it('should not have console errors during normal flow', () => {
      cy.window().then((win) => {
        cy.spy(win.console, 'error');
      });

      cy.contains('Get Started').click();
      cy.contains("I'm a Candidate").click();

      cy.window().then((win) => {
        expect(win.console.error).not.to.be.called;
      });
    });

    it('should handle network errors gracefully', () => {
      // Intercept API calls and force them to fail
      cy.intercept('POST', '**/auth/login/', { forceNetworkError: true }).as('loginRequest');

      cy.contains('Login').click();
      cy.contains("I'm a Candidate").click();
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.contains(/An error occurred|Network error/i).should('be.visible');
    });
  });
});
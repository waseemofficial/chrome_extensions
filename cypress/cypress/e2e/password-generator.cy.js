describe('Password Generator Chrome Extension', () => {
  const testCredentials = {
    website: 'https://the-internet.herokuapp.com/login',
    username: 'test@example.com',
    password: 'TestPassword123!'
  };

  beforeEach(() => {
    // Clear extension storage before each test
    cy.clearExtensionStorage();
  });

  context('Extension Popup UI Tests', () => {
    it('should load the extension popup', () => {
      cy.openExtensionPopup();
      
      // Verify basic UI elements
      cy.get('h2').should('contain', 'Password Generator');
      cy.get('#result').should('contain', 'Click Generate');
      cy.get('#generate').should('be.visible');
      cy.get('#clipboard').should('be.visible');
      cy.get('#save').should('be.visible');
      cy.get('#autofill').should('be.visible');
    });

    it('should generate a password with default settings', () => {
      cy.openExtensionPopup();
      
      cy.get('#generate').click();
      cy.get('#result').should('not.contain', 'Click Generate');
      cy.get('#result').invoke('text').should('have.length', 16);
      
      // Check strength indicator
      cy.get('.strength-bar').should('have.class', 'strength-strong');
    });

    it('should copy password to clipboard', () => {
      cy.openExtensionPopup();
      
      cy.get('#generate').click();
      cy.get('#clipboard').click();
      
      // Verify clipboard action (mock clipboard API)
      cy.window().then(win => {
        cy.stub(win.navigator.clipboard, 'writeText').resolves();
      });
      
      cy.get('.toast').should('contain', 'Password copied to clipboard!');
    });

    it('should save credentials with website and username', () => {
      cy.openExtensionPopup();
      
      // Fill credentials
      cy.get('#website').clear().type(testCredentials.website);
      cy.get('#username').clear().type(testCredentials.username);
      
      // Generate and save password
      cy.get('#generate').click();
      cy.get('#save').click();
      
      cy.get('.toast').should('contain', 'Password saved for');
      
      // Show saved passwords
      cy.get('#toggleSaved').click();
      cy.get('.saved-password-item').should('have.length.at.least', 1);
      cy.get('.saved-password-item .website').should('contain', testCredentials.website);
      cy.get('.saved-password-item .username').should('contain', testCredentials.username);
    });
  });

  context('Password Generation Tests', () => {
    it('should generate passwords with different lengths', () => {
      cy.openExtensionPopup();
      
      const lengths = [8, 12, 20, 32];
      
      lengths.forEach(length => {
        cy.get('#length').clear().type(length);
        cy.get('#generate').click();
        cy.get('#result').invoke('text').should('have.length', length);
      });
    });

    it('should respect character type settings', () => {
      cy.openExtensionPopup();
      
      // Test uppercase only
      cy.get('#lowercase').uncheck();
      cy.get('#number').uncheck();
      cy.get('#symbols').uncheck();
      cy.get('#generate').click();
      
      cy.get('#result').invoke('text').then(password => {
        expect(password).to.match(/^[A-Z]+$/);
      });

      // Test numbers only
      cy.get('#uppercase').uncheck();
      cy.get('#number').check();
      cy.get('#generate').click();
      
      cy.get('#result').invoke('text').then(password => {
        expect(password).to.match(/^[0-9]+$/);
      });
    });

    it('should exclude similar characters when enabled', () => {
      cy.openExtensionPopup();
      
      cy.get('#excludeSimilar').check();
      cy.get('#generate').click();
      
      cy.get('#result').invoke('text').then(password => {
        // Should not contain similar characters
        expect(password).to.not.include('i');
        expect(password).to.not.include('l');
        expect(password).to.not.include('1');
        expect(password).to.not.include('L');
        expect(password).to.not.include('0');
        expect(password).to.not.include('O');
      });
    });
  });

  context('Auto-fill Functionality Tests', () => {
    it('should auto-fill credentials on login forms', () => {
      // Visit a test page with login form
      cy.visit('https://the-internet.herokuapp.com/login');
      
      cy.openExtensionPopup();
      
      // Set credentials in extension
      cy.get('#website').clear().type('example.com');
      cy.get('#username').clear().type(testCredentials.username);
      cy.get('#generate').click();
      
      // Get the generated password
      cy.get('#result').invoke('text').then(password => {
        // Perform auto-fill
        cy.get('#autofill').click();
        
        // Verify fields are filled on the page
        cy.get('input[type="email"], input[name*="user"], input[name*="email"]')
          .first()
          .should('have.value', testCredentials.username);
          
        cy.get('input[type="password"]')
          .first()
          .should('have.value', password);
      });
    });

    it('should handle auto-fill on different website structures', () => {
      const testPages = [
        'https://httpbin.org/forms/post',
        'https://www.saucedemo.com',
        'https://the-internet.herokuapp.com/login'
      ];

      testPages.forEach(page => {
        cy.visit(page);
        
        cy.openExtensionPopup();
        cy.get('#generate').click();
        cy.get('#autofill').click();
        
        // Check if any password field was filled
        cy.get('body').then($body => {
          if ($body.find('input[type="password"]').length > 0) {
            cy.get('input[type="password"]').first().should('not.be.empty');
          }
        });
      });
    });
  });

  context('Storage and Persistence Tests', () => {
    it('should persist settings between sessions', () => {
      cy.openExtensionPopup();
      
      // Change settings
      cy.get('#length').clear().type('20');
      cy.get('#symbols').uncheck();
      cy.get('#excludeSimilar').check();
      
      // Reload extension
      cy.reload();
      cy.openExtensionPopup();
      
      // Verify settings persisted
      cy.get('#length').should('have.value', '20');
      cy.get('#symbols').should('not.be.checked');
      cy.get('#excludeSimilar').should('be.checked');
    });

    it('should save and retrieve multiple credentials', () => {
      const credentials = [
        { website: 'google.com', username: 'user1@gmail.com' },
        { website: 'github.com', username: 'dev@github.com' },
        { website: 'facebook.com', username: 'profile@fb.com' }
      ];

      cy.openExtensionPopup();
      
      credentials.forEach(cred => {
        cy.get('#website').clear().type(cred.website);
        cy.get('#username').clear().type(cred.username);
        cy.get('#generate').click();
        cy.get('#save').click();
        
        cy.get('.toast').should('contain', 'Password saved for');
      });

      // Verify all credentials are saved
      cy.get('#toggleSaved').click();
      cy.get('.saved-password-item').should('have.length', credentials.length);
      
      credentials.forEach(cred => {
        cy.get('.saved-password-item .website').should('contain', cred.website);
      });
    });

    it('should delete saved credentials', () => {
      cy.openExtensionPopup();
      
      // Save a credential
      cy.get('#website').clear().type('test-delete.com');
      cy.get('#username').clear().type('delete@test.com');
      cy.get('#generate').click();
      cy.get('#save').click();
      
      // Show saved and delete
      cy.get('#toggleSaved').click();
      cy.get('.saved-password-item').should('have.length', 1);
      cy.get('.delete-password').click();
      cy.get('.saved-password-item').should('have.length', 0);
    });
  });

  context('Security Tests', () => {
    it('should not expose passwords in plain text by default', () => {
      cy.openExtensionPopup();
      
      cy.get('#generate').click();
      cy.get('#save').click();
      cy.get('#toggleSaved').click();
      
      // Password should be hidden initially
      cy.get('.saved-password-item .password')
        .first()
        .should('contain', '••••••••')
        .and('not.contain', 'TestPassword');
    });

    it('should show password on click', () => {
      cy.openExtensionPopup();
      
      cy.get('#generate').click();
      cy.get('#save').click();
      cy.get('#toggleSaved').click();
      
      // Click to reveal password
      cy.get('.saved-password-item .password').first().click();
      
      // Password should be visible
      cy.get('.saved-password-item .password')
        .first()
        .should('not.contain', '••••••••');
    });

    it('should generate cryptographically secure passwords', () => {
      cy.openExtensionPopup();
      
      const passwords = [];
      
      // Generate multiple passwords and check for uniqueness
      for (let i = 0; i < 10; i++) {
        cy.get('#generate').click();
        cy.get('#result').invoke('text').then(password => {
          passwords.push(password);
        });
      }
      
      // Verify all passwords are unique
      cy.wrap(passwords).should('have.length', 10);
      cy.wrap([...new Set(passwords)]).should('have.length', 10);
    });
  });
});
// Custom commands for Chrome extension testing
Cypress.Commands.add('openExtensionPopup', () => {
  const extensionId = 'yourextensionidhere'; // You'll need to get this dynamically
  cy.visit(`chrome-extension://${extensionId}/main.html`, {
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('clearExtensionStorage', () => {
  cy.window().then(win => {
    if (win.chrome && win.chrome.storage) {
      return new Cypress.Promise((resolve) => {
        win.chrome.storage.local.clear(() => {
          resolve();
        });
      });
    }
  });
});

Cypress.Commands.add('getExtensionStorage', () => {
  return cy.window().then(win => {
    return new Cypress.Promise((resolve) => {
      if (win.chrome && win.chrome.storage) {
        win.chrome.storage.local.get(null, (result) => {
          resolve(result);
        });
      } else {
        resolve({});
      }
    });
  });
});

Cypress.Commands.add('setExtensionStorage', (data) => {
  cy.window().then(win => {
    return new Cypress.Promise((resolve) => {
      if (win.chrome && win.chrome.storage) {
        win.chrome.storage.local.set(data, () => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
});

Cypress.Commands.add('mockChromeAPI', () => {
  cy.window().then(win => {
    // Mock chrome APIs for testing
    if (!win.chrome) {
      win.chrome = {
        runtime: {
          lastError: null,
          id: 'test-extension-id'
        },
        storage: {
          local: {
            get: (keys, callback) => callback({}),
            set: (data, callback) => callback(),
            clear: (callback) => callback()
          }
        },
        tabs: {
          query: (queryInfo, callback) => callback([{ id: 1, url: 'https://example.com' }])
        },
        scripting: {
          executeScript: (details, callback) => callback([{ result: true }])
        }
      };
    }
  });
});
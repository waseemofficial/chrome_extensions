const { defineConfig } = require('cypress');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        const extensionPath = path.join(__dirname, '../../../chrome_extensions');
        
        if (browser.name === 'chrome' || browser.name === 'chromium') {
          launchOptions.args.push(
            `--load-extension=${extensionPath}`,
            '--disable-extensions-except=${extensionPath}',
            '--disable-web-security',
            '--disable-features=CrossSiteDocumentBlockingIfIsolating',
            '--auto-open-devtools-for-tabs'
          );
          
          launchOptions.extensions.push(extensionPath);
        }
        return launchOptions;
      });
    },
    baseUrl: 'https://the-internet.herokuapp.com/login',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    chromeWebSecurity: false,
    viewportWidth: 1200,
    viewportHeight: 800,
  },
});
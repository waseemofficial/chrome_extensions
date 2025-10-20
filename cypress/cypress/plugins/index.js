const _ = require('lodash')
const del = require('del')
const path = require("path")
const { install, ensureBrowserFlags } = require('@neuralegion/cypress-har-generator');

module.exports = (on, config) => {
  install(on, config);
  require('cypress-grep/src/plugin')(config)
  
  on("task", {
    failed: require('cypress-failed-log/src/failed')(),
  });

  on('before:browser:launch', (browser = {}, launchOptions) => {
    ensureBrowserFlags(browser, launchOptions);
    
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      // Remove headless mode for extension testing
      const headlessIndex = launchOptions.args.indexOf('--headless');
      if (headlessIndex > -1) {
        launchOptions.args.splice(headlessIndex, 1);
      }
      
      // Add these flags for extension support
      launchOptions.args.push('--disable-web-security');
      launchOptions.args.push('--disable-features=CrossSiteDocumentBlockingIfIsolating');
      launchOptions.args.push('--disable-site-isolation-trials');
      launchOptions.args.push('--disable-blink-features=BlockCredentialedSubresources');
      
      // Load your extension - make sure this path is correct
      const extensionPath = path.resolve(__dirname, "../../chrome_extensions");
      launchOptions.args.push(`--load-extension=${extensionPath}`);
      
      // Enable extensions
      launchOptions.args.push('--disable-extensions=false');
    }
    
    return launchOptions;
  });

  // Clean up videos on test success
  on('after:spec', (spec, results) => {
    if (results && results.video) {
      const failures = _.some(results.tests, (test) => {
        return _.some(test.attempts, { state: 'failed' })
      })
      if (!failures) {
        return del(results.video);
      }
    }
  });

  return config;
}
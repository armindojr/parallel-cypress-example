// / <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const fs = require('fs');
const path = require('path');

function getConfigurationByFile(file) {
    const pathToConfigFile = path.resolve('.', 'cypress', 'config', `${file}.json`);

    return JSON.parse(fs.readFileSync(pathToConfigFile));
}

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
            launchOptions.args.push('--disable-dev-shm-usage');
        }

        return launchOptions;
    });

    const file = config.env.configFile || 'default';
    return getConfigurationByFile(file);
};

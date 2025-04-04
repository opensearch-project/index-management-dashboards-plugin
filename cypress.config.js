const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: "cypress/e2e/plugins/index-management-dashboards-plugin/*.{js,jsx,ts,tsx}",
    defaultCommandTimeout: 60000,
    requestTimeout: 60000,
    responseTimeout: 60000,
    baseUrl: "http://localhost:5601",
    viewportWidth: 1280,
    viewportHeight: 720,

    // Performance optimizations
    numTestsKeptInMemory: 0,
    experimentalMemoryManagement: true,
    video: false,
    watchForFileChanges: false,
    chromeWebSecurity: false,
    modifyObstructiveCode: false,

    // Environment variables
    env: {
      openSearchUrl: "http://localhost:9200",
      SECURITY_ENABLED: false,
      username: "admin",
      password: "admin",
    },

    // Certificate configurations
    clientCertificates: [
      {
        url: "https://localhost:9200/.opendistro-ism*",
        ca: ["cypress/resources/root-ca.pem"],
        certs: [
          {
            cert: "cypress/resources/kirk.pem",
            key: "cypress/resources/kirk-key.pem",
            passphrase: "",
          },
        ],
      },
      {
        url: "https://localhost:9200/.opendistro-ism-config/_update_by_query/",
        ca: ["cypress/resources/root-ca.pem"],
        certs: [
          {
            cert: "cypress/resources/kirk.pem",
            key: "cypress/resources/kirk-key.pem",
            passphrase: "",
          },
        ],
      },
    ],
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },
  },
});

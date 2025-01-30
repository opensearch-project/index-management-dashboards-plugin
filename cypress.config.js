const { defineConfig } = require("cypress");
const fs = require("fs");
const path = require("path");

module.exports = defineConfig({
  e2e: {
    specPattern: "cypress/e2e/plugins/index-management-dashboards-plugin/*.{js,jsx,ts,tsx}",
    defaultCommandTimeout: 60000,
    requestTimeout: 60000,
    responseTimeout: 60000,
    baseUrl: "http://localhost:5601",
    viewportWidth: 2000,
    viewportHeight: 1320,
    env: {
      openSearchUrl: "http://localhost:9200",
      SECURITY_ENABLED: false,
      username: "admin",
      password: "admin",
    },
    setupNodeEvents(on, config) {
      on("task", {
        readCertAndKey() {
          const cert = fs.readFileSync(path.resolve(__dirname, "cypress/resources/kirk.pem"));
          const key = fs.readFileSync(path.resolve(__dirname, "cypress/resources/kirk-key.pem"));
          return { cert, key };
        },
      });
      // implement node event listeners here
      return config;
    },
  },
});

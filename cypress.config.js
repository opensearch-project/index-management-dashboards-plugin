const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: "cypress/e2e/plugins/index-management-dashboards-plugin/*.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:5601",

    // Timeouts
    defaultCommandTimeout: 60000,
    requestTimeout: 60000,
    responseTimeout: 60000,

    // Lighter footprint in CI
    viewportWidth: 1280,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    retries: 1,

    // Performance knobs
    numTestsKeptInMemory: 0,
    experimentalMemoryManagement: true,

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
      // Harden Chrome for CI; avoid Electron/Chrome renderer OOMs.
      on("before:browser:launch", (browser = {}, launchOptions) => {
        if (browser.family === "chromium") {
          // Increase V8 heap for test app JS
          launchOptions.args.push("--js-flags=--max-old-space-size=262144");
          // CI stability flags
          launchOptions.args.push("--disable-dev-shm-usage");
          launchOptions.args.push("--no-sandbox");
          launchOptions.args.push("--disable-gpu");
          launchOptions.args.push("--disable-software-rasterizer");
          launchOptions.args.push("--disable-features=VizDisplayCompositor");
          // Modern headless is a bit leaner
          launchOptions.args.push("--headless=new");
        }
        return launchOptions;
      });

      return config;
    },
  },
});

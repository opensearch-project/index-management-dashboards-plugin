# Index Management Dashboards

The Index Management Dashboards plugin lets you manage your [Index Management Dashboards plugin](https://github.com/opensearch-project/index-management-dashboards-plugin) to view, monitor, and manage your indices directly from OpenSearch-Dashboards.

## Documentation

Please see our [documentation](https://opendistro.github.io/for-elasticsearch-docs/).

## Setup

1. Download OpenSearch for the version that matches the [OpenSearch Dashboard version specified in package.json](./package.json#L9).
1. Download and install the appropriate [OpenSearch Index Management plugin](https://github.com/opensearch-project/index-management).
1. Download the OpenSearch-Dashboards source code for the [version specified in package.json](./package.json#L9) you want to set up.

   See the [OpenSearch Dashboards contributing guide](https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/CONTRIBUTING.md#setting-up-your-development-environment) for more instructions on setting up your development environment.
   
1. Change your node version to the version specified in `.node-version` inside the OpenSearch-Dashboards root directory.
1. cd into the `plugins` directory of the OpenSearch-Dashboards source code directory.
1. Check out this package from version control into the `plugins` directory.
1. Run `yarn osd bootstrap` inside `OpenSearch-Dashboards/plugins/index-management-dashboards-plugin`.

Ultimately, your directory structure should look like this:

```md
.
├── OpenSearch-Dashboards
│   └── plugins
│       └── index-management-dashboards-plugin
```


## Build

To build the plugin's distributable zip simply run `yarn build`.

Example output: `./build/indexManagementOpenSearchDashboards-1.12.0.0.zip`


## Run

- `yarn start`

  - Starts OpenSearch-Dashboards and includes this plugin. OpenSearch-Dashboards will be available on `localhost:5601`.
  - Please run in the OpenSearch-Dashboards root directory
  - You must have OpenSearch running with the Index Management plugin

## Test

There are unit/stubbed integration tests and cypress e2e/integration tests.

To run the cypress tests, you must have both OpenSearch and OpenSearch-Dashboards running with the Index Management plugin running.

If you are running cypress tests with OpenSearch-Dashboards development server use the `--no-base-path` option and if you are writing Cypress tests use the `--no-watch` to make sure your server is not restarted.

- `yarn test:jest`

  - Runs the plugin tests.
  
- `yarn run cypress open`

  - Opens the Cypress test runner

- `yarn run cypress run`

  - Runs the Cypress test runner

## Contributing to Index Management Dashboards Plugin

- Refer to [CONTRIBUTING.md](./CONTRIBUTING.md).
- Since this is an OpenSearch-Dashboards plugin, it can be useful to review the [OpenSearch Dashboards contributing guide](https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/CONTRIBUTING.md)

## Get Started and Contribute!

You can get started by:
- [Reporting](https://github.com/opensearch-project/index-management-dashboards-plugin/issues) a bug
- [Proposing](https://github.com/opensearch-project/index-management-dashboards-plugin/issues) new ideas to enhance the plugin
- [Contribute](https://github.com/opensearch-project/index-management-dashboards-plugin/issues) documentation and sample code
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) for more details to get involved in the project.

## Questions

Please feel free to come ask questions on the Open Distro community discussion forum.

## License

This code is licensed under the Apache 2.0 License. 

## Copyright

Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.



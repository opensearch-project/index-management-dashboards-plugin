/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppMountParameters,
  CoreSetup,
  CoreStart,
  DEFAULT_APP_CATEGORIES,
  Plugin,
  PluginInitializerContext,
} from "../../../src/core/public";
import { IndexManagementPluginSetup } from ".";
import { IndexManagementPluginStart } from ".";
import { actionRepoSingleton } from "./pages/VisualCreatePolicy/utils/helpers";
import { ROUTES } from "./utils/constants";
import { JobHandlerRegister } from "./JobHandler";
import { Navigation, Pathname } from "./pages/Main/Main";
import { ManagementOverViewPluginSetup } from "../../../src/plugins/management_overview/public";

interface IndexManagementSetupDeps {
  managementOverview?: ManagementOverViewPluginSetup;
}

export class IndexManagementPlugin implements Plugin<IndexManagementPluginSetup, IndexManagementPluginStart, IndexManagementSetupDeps> {
  constructor(private readonly initializerContext: PluginInitializerContext) {
    // can retrieve config from initializerContext
  }

  public setup(core: CoreSetup, { managementOverview }: IndexManagementSetupDeps): IndexManagementPluginSetup {
    JobHandlerRegister(core);

    if (managementOverview) {
      managementOverview.register({
        id: "opensearch_index_management_dashboards",
        title: "Index Management",
        order: 9010,
        pages: [
          {
            title: Navigation.IndexPolicies,
            url: `#${Pathname.IndexPolicies}`,
            order: 100,
          },
          {
            title: Navigation.Indices,
            url: `#${Pathname.Indices}`,
            order: 200,
          },
          {
            title: Navigation.Templates,
            url: `#${ROUTES.TEMPLATES}`,
            order: 300,
          },
          {
            title: Navigation.Aliases,
            url: `#${ROUTES.ALIASES}`,
            order: 400,
          },
          {
            title: Navigation.DataStreams,
            url: `#${ROUTES.DATA_STREAMS}`,
            order: 500,
          },
          {
            title: Navigation.Rollups,
            url: `#${ROUTES.ROLLUPS}`,
            order: 600,
          },
        ],
      });
      managementOverview.register({
        id: "opensearch_snapshot_management_dashboards",
        title: "Snapshot Management",
        order: 9020,
        pages: [
          {
            title: Navigation.SnapshotPolicies,
            url: `#${Pathname.SnapshotPolicies}`,
            order: 100,
          },
          {
            title: Navigation.Snapshots,
            url: `#${Pathname.Snapshots}`,
            order: 200,
          },
          {
            title: Navigation.Repositories,
            url: `#${ROUTES.REPOSITORIES}`,
            order: 300,
          },
        ],
      });
    }

    core.application.register({
      id: "opensearch_index_management_dashboards",
      title: "Index Management",
      order: 9010,
      category: DEFAULT_APP_CATEGORIES.management,
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import("./index_management_app");
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params, ROUTES.INDEX_POLICIES);
      },
    });

    core.application.register({
      id: "opensearch_snapshot_management_dashboards",
      title: "Snapshot Management",
      order: 9020,
      category: DEFAULT_APP_CATEGORIES.management,
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import("./index_management_app");
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params, ROUTES.SNAPSHOT_POLICIES);
      },
    });

    return {
      registerAction: (actionType, uiActionCtor, defaultAction) => {
        actionRepoSingleton.registerAction(actionType, uiActionCtor, defaultAction);
      },
    };
  }

  public start(core: CoreStart): IndexManagementPluginStart {
    Object.freeze(actionRepoSingleton.repository);
    // After this point, calling registerAction will throw error because "Object is not extensible"
    return {};
  }
}

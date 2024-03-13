/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from "@osd/i18n";
import { IndexManagementPluginStart, IndexManagementPluginSetup } from ".";
import {
  AppMountParameters,
  CoreSetup,
  CoreStart,
  DEFAULT_APP_CATEGORIES,
  Plugin,
  PluginInitializerContext,
} from "../../../src/core/public";
import { actionRepoSingleton } from "./pages/VisualCreatePolicy/utils/helpers";
import { ROUTES } from "./utils/constants";
import { JobHandlerRegister } from "./JobHandler";
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
        description: i18n.translate("indexManagement.description", {
          defaultMessage: "Manage your indexes with state polices, templates and aliases. You can also roll up or transform your indexes.",
        }),
      });
      managementOverview.register({
        id: "opensearch_snapshot_management_dashboards",
        title: "Snapshot Management",
        order: 9020,
        description: i18n.translate("snapshotManagement.description", {
          defaultMessage:
            "Back up and restore your cluster's indexes and state. Setup a policy to automate snapshot creation and deletion.",
        }),
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
        return renderApp(coreStart, depsStart, params, ROUTES.INDEX_POLICIES);
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
        return renderApp(coreStart, depsStart, params, ROUTES.SNAPSHOT_POLICIES);
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

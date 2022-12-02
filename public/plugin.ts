/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppMountParameters, CoreSetup, CoreStart, Plugin, PluginInitializerContext } from "../../../src/core/public";
import { IndexManagementPluginSetup } from ".";
import { IndexManagementPluginStart } from ".";
import { actionRepoSingleton } from "./pages/VisualCreatePolicy/utils/helpers";
import { ROUTES } from "./utils/constants";
import { jobSchedulerInstance } from "./context/JobSchedulerContext";
import { IndexService } from "./services";
import { ReindexJobMetaData } from "./models/interfaces";

export class IndexManagementPlugin implements Plugin<IndexManagementPluginSetup, IndexManagementPluginStart> {
  constructor(private readonly initializerContext: PluginInitializerContext) {
    // can retrieve config from initializerContext
  }

  public setup(core: CoreSetup): IndexManagementPluginSetup {
    const indexService = new IndexService(core.http);
    jobSchedulerInstance.addCallback({
      callbackName: "callbackForReindex",
      callback: async (job: ReindexJobMetaData) => {
        const extras = job.extras;
        const indexResult = await indexService.getIndices({
          from: 0,
          size: 10,
          search: extras.destIndex,
          terms: extras.destIndex,
          sortField: "index",
          sortDirection: "desc",
          showDataStreams: extras.isDataStream || false,
        });
        if (indexResult.ok) {
          const [firstItem] = indexResult.response.indices || [];
          if (firstItem && firstItem.status !== "reindex") {
            core.notifications.toasts.addSuccess(
              `Reindex from [${extras.sourceIndex}] to [${extras.destIndex}] has been finished successfully.`,
              {
                toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
              }
            );
            return true;
          }
        }

        return false;
      },
      listenType: "reindex",
    });
    core.application.register({
      id: "opensearch_index_management_dashboards",
      title: "Index Management",
      order: 7000,
      category: {
        id: "opensearch",
        label: "OpenSearch Plugins",
        order: 2000,
      },
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import("./index_management_app");
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params, ROUTES.INDEX_POLICIES);
      },
    });

    core.application.register({
      id: "opensearch_snapshot_management_dashboards",
      title: "Snapshot Management",
      order: 7000,
      category: {
        id: "opensearch",
        label: "OpenSearch Plugins",
        order: 2000,
      },
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

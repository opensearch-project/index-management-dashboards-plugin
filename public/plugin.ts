/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from "@osd/i18n";
import { IndexManagementPluginStart, IndexManagementPluginSetup } from ".";
import {
  AppCategory,
  AppMountParameters,
  AppUpdater,
  CoreSetup,
  CoreStart,
  DEFAULT_APP_CATEGORIES,
  DEFAULT_NAV_GROUPS,
  Plugin,
  PluginInitializerContext,
  WorkspaceAvailability,
} from "../../../src/core/public";
import { actionRepoSingleton } from "./pages/VisualCreatePolicy/utils/helpers";
import { ROUTES } from "./utils/constants";
import { JobHandlerRegister } from "./JobHandler";
import { ManagementOverViewPluginSetup } from "../../../src/plugins/management_overview/public";
import { DataSourceManagementPluginSetup } from "../../../src/plugins/data_source_management/public";
import { dataSourceObservable } from "./pages/Main/Main";
import { BehaviorSubject } from "rxjs";
import { useLocation } from "react-router-dom";
import { DataSourceOption } from "src/plugins/data/public";

interface IndexManagementSetupDeps {
  managementOverview?: ManagementOverViewPluginSetup;
  dataSourceManagement?: DataSourceManagementPluginSetup;
}

const ISM_CATEGORIES: Record<string, AppCategory> = Object.freeze({
  indexes: {
    id: "indexes",
    label: "Indexes",
    order: 2000,
    euiIconType: "managementApp",
  },
  index_backup_and_recovery: {
    id: "index_backup_and_recovery",
    label: "Index Backup and Recovery",
    order: 3000,
    euiIconType: "managementApp",
  },
});

export class IndexManagementPlugin implements Plugin<IndexManagementPluginSetup, IndexManagementPluginStart, IndexManagementSetupDeps> {
  constructor(private readonly initializerContext: PluginInitializerContext) {
    // can retrieve config from initializerContext
  }

  private updateDefaultRouteOfManagementApplications: AppUpdater = () => {
    // let url = new URL(window.location.hash);
    // console.log("current url", url);
    // let params = new URLSearchParams(window.location.search);
    // // replace dataSourceId with the selected data source
    // // let dataSourceId = params.get("dataSourceId");
    let dataSourceId = dataSourceObservable.value?.id;
    console.log("updating dataSourceId", dataSourceId);
    let hash = "";
    if (dataSourceId) {
      hash = `#/?dataSourceId=${dataSourceId}`;
      // url.searchParams.set("dataSourceId", dataSourceId);
    }
    console.log("updated url", `${hash}`);
    return {
      defaultPath: hash,
    };
  };

  private appStateUpdater = new BehaviorSubject<AppUpdater>(this.updateDefaultRouteOfManagementApplications);

  public setup(core: CoreSetup, { managementOverview, dataSourceManagement }: IndexManagementSetupDeps): IndexManagementPluginSetup {
    JobHandlerRegister(core);

    const mountWrapper = async (params: AppMountParameters, redirect: string) => {
      const { renderApp } = await import("./index_management_app");
      const [coreStart, depsStart] = await core.getStartServices();
      return renderApp(coreStart, depsStart, params, redirect, dataSourceManagement);
    };

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

    const imApplicationID = "opensearch_index_management_dashboards";
    const smApplicationID = "opensearch_snapshot_management_dashboards";

    core.application.register({
      id: imApplicationID,
      title: "Index Management",
      order: 9010,
      category: DEFAULT_APP_CATEGORIES.management,
      workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import("./index_management_app");
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, depsStart, params, ROUTES.INDEX_POLICIES, dataSourceManagement);
      },
    });

    core.application.register({
      id: smApplicationID,
      title: "Snapshot Management",
      order: 9020,
      category: DEFAULT_APP_CATEGORIES.management,
      workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import("./index_management_app");
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, depsStart, params, ROUTES.SNAPSHOT_POLICIES, dataSourceManagement);
      },
    });

    // Register with category and use case information
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.dataAdministration, [
      {
        id: imApplicationID,
        category: DEFAULT_APP_CATEGORIES.management,
      },
    ]);

    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.dataAdministration, [
      {
        id: smApplicationID,
        category: DEFAULT_APP_CATEGORIES.management,
      },
    ]);

    // In-app navigation registration

    if (core.chrome.navGroup.getNavGroupEnabled()) {
      // indices route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.INDICES)}`,
        title: "Indexes",
        order: 8040,
        category: ISM_CATEGORIES.indexes,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.INDICES);
        },
      });

      // policy managed index route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.MANAGED_INDICES)}`,
        title: "Policy Managed Indexes",
        order: 8040,
        category: ISM_CATEGORIES.indexes,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.MANAGED_INDICES);
        },
      });

      // data streams route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.DATA_STREAMS)}`,
        title: "Data Streams",
        order: 8040,
        category: ISM_CATEGORIES.indexes,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.DATA_STREAMS);
        },
      });

      // index alias route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.ALIASES)}`,
        title: "Index Aliases",
        order: 8040,
        category: ISM_CATEGORIES.indexes,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.ALIASES);
        },
      });

      // index state management policies route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.INDEX_POLICIES)}`,
        title: "Index State Management Policies",
        order: 8040,
        category: ISM_CATEGORIES.indexes,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.INDEX_POLICIES);
        },
      });

      // index templates route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.TEMPLATES)}`,
        title: "Index Templates",
        order: 8040,
        category: ISM_CATEGORIES.indexes,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.TEMPLATES);
        },
      });

      // notification settings route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.NOTIFICATIONS)}`,
        title: "Notification Settings",
        order: 8040,
        category: ISM_CATEGORIES.indexes,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.NOTIFICATIONS);
        },
      });

      // rollup jobs route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.ROLLUPS)}`,
        title: "Rollup Jobs",
        order: 8040,
        category: ISM_CATEGORIES.indexes,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.ROLLUPS);
        },
      });

      // transform jobs route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.TRANSFORMS)}`,
        title: "Transform Jobs",
        order: 8040,
        category: ISM_CATEGORIES.indexes,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.TRANSFORMS);
        },
      });

      // index snapshots route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.SNAPSHOTS)}`,
        title: "Index Snapshots",
        order: 8040,
        category: ISM_CATEGORIES.index_backup_and_recovery,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.SNAPSHOTS);
        },
      });

      // snapshot policies route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.SNAPSHOT_POLICIES)}`,
        title: "Snapshot Policies",
        order: 8040,
        category: ISM_CATEGORIES.index_backup_and_recovery,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.SNAPSHOT_POLICIES);
        },
      });

      // snapshot repositories route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.REPOSITORIES)}`,
        title: "Snapshot Repositories",
        order: 8040,
        category: ISM_CATEGORIES.index_backup_and_recovery,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.REPOSITORIES);
        },
      });
    }

    dataSourceObservable.subscribe((dataSourceOption) => {
      if (dataSourceOption) {
        console.log("dataSourceOption", dataSourceOption);
        this.appStateUpdater.next(this.updateDefaultRouteOfManagementApplications);
      }
    });

    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.dataAdministration, [
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.INDICES)}`,
        category: ISM_CATEGORIES.indexes,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.MANAGED_INDICES)}`,
        category: ISM_CATEGORIES.indexes,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.DATA_STREAMS)}`,
        category: ISM_CATEGORIES.indexes,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.ALIASES)}`,
        category: ISM_CATEGORIES.indexes,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.INDEX_POLICIES)}`,
        category: ISM_CATEGORIES.indexes,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.TEMPLATES)}`,
        category: ISM_CATEGORIES.indexes,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.NOTIFICATIONS)}`,
        category: ISM_CATEGORIES.indexes,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.ROLLUPS)}`,
        category: ISM_CATEGORIES.indexes,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.TRANSFORMS)}`,
        category: ISM_CATEGORIES.indexes,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.SNAPSHOTS)}`,
        category: ISM_CATEGORIES.index_backup_and_recovery,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.SNAPSHOT_POLICIES)}`,
        category: ISM_CATEGORIES.index_backup_and_recovery,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.REPOSITORIES)}`,
        category: ISM_CATEGORIES.index_backup_and_recovery,
      },
    ]);

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

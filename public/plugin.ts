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

const ISM_FEATURE_DESCRIPTION: Record<string, string> = Object.freeze({
  index_management: i18n.translate("indexManagement.description", {
    defaultMessage: "Manage your indexes with state polices, templates and aliases. You can also roll up or transform your indexes.",
  }),
  snapshot_management: i18n.translate("snapshotManagement.description", {
    defaultMessage: "Back up and restore your cluster's indexes and state. Setup a policy to automate snapshot creation and deletion.",
  }),
  indexes: i18n.translate("indexes.description", {
    defaultMessage: "Manage your indexes",
  }),
  policy_managed_indexes: i18n.translate("policyManagedIndexes.description", {
    defaultMessage: "Manage your policy managed indexes",
  }),
  data_streams: i18n.translate("dataStreams.description", {
    defaultMessage: "Manage your data streams",
  }),
  aliases: i18n.translate("aliases.description", {
    defaultMessage: "Manage your index aliases",
  }),
  index_state_management_policies: i18n.translate("indexStateManagementPolicies.description", {
    defaultMessage: "Manage your index state management policies",
  }),
  index_templates: i18n.translate("indexTemplates.description", {
    defaultMessage: "Manage your index templates",
  }),
  notification_settings: i18n.translate("notificationSettings.description", {
    defaultMessage: "Manage your notification settings",
  }),
  rollup_jobs: i18n.translate("rollupJobs.description", {
    defaultMessage: "Manage your rollup jobs",
  }),
  transform_jobs: i18n.translate("transformJobs.description", {
    defaultMessage: "Manage your transform jobs",
  }),
  index_snapshots: i18n.translate("indexSnapshots.description", {
    defaultMessage: "Manage your index snapshots",
  }),
  snapshot_policies: i18n.translate("snapshotPolicies.description", {
    defaultMessage: "Manage your snapshot policies",
  }),
  snapshot_repositories: i18n.translate("snapshotRepositories.description", {
    defaultMessage: "Manage your snapshot repositories",
  }),
});

export class IndexManagementPlugin implements Plugin<IndexManagementPluginSetup, IndexManagementPluginStart, IndexManagementSetupDeps> {
  constructor(private readonly initializerContext: PluginInitializerContext) {
    // can retrieve config from initializerContext
  }

  private updateDefaultRouteOfManagementApplications: AppUpdater = () => {
    const hash = `#/?dataSourceId=${dataSourceObservable.value?.id || ""}`;
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
      description: ISM_FEATURE_DESCRIPTION.index_management,
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
      description: ISM_FEATURE_DESCRIPTION.snapshot_management,
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import("./index_management_app");
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, depsStart, params, ROUTES.SNAPSHOT_POLICIES, dataSourceManagement);
      },
    });

    // In-app navigation registration

    if (core.chrome.navGroup.getNavGroupEnabled()) {
      // indices route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.INDICES)}`,
        title: "Indexes",
        order: 8040,
        category: ISM_CATEGORIES.indexes,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        description: ISM_FEATURE_DESCRIPTION.indexes,
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
        description: ISM_FEATURE_DESCRIPTION.policy_managed_indexes,
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
        description: ISM_FEATURE_DESCRIPTION.data_streams,
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
        description: ISM_FEATURE_DESCRIPTION.aliases,
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
        description: ISM_FEATURE_DESCRIPTION.index_state_management_policies,
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
        description: ISM_FEATURE_DESCRIPTION.index_templates,
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
        description: ISM_FEATURE_DESCRIPTION.notification_settings,
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
        description: ISM_FEATURE_DESCRIPTION.rollup_jobs,
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
        description: ISM_FEATURE_DESCRIPTION.transform_jobs,
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
        description: ISM_FEATURE_DESCRIPTION.index_snapshots,
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
        description: ISM_FEATURE_DESCRIPTION.snapshot_policies,
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
        description: ISM_FEATURE_DESCRIPTION.snapshot_repositories,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.REPOSITORIES);
        },
      });
    }

    dataSourceObservable.subscribe((dataSourceOption) => {
      if (dataSourceOption) {
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

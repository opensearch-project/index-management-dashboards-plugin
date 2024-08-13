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
import { NavigationPublicPluginStart } from "../../../src/plugins/navigation/public";
import { setApplication, setNavigationUI, setUISettings } from "./services/Services";

interface IndexManagementSetupDeps {
  managementOverview?: ManagementOverViewPluginSetup;
  dataSourceManagement?: DataSourceManagementPluginSetup;
}

const ISM_CATEGORIES: Record<string, AppCategory> = Object.freeze({
  automation_policies: {
    id: "automation_policies",
    label: "Automation policies",
    order: 2000,
  },
  templates: {
    id: "templates",
    label: "Templates",
    order: 3000,
  },
  index_backup_and_recovery: {
    id: "index_backup_and_recovery",
    label: "Index backup and recovery",
    order: 4000,
  },
});

const ISM_FEATURE_DESCRIPTION: Record<string, string> = Object.freeze({
  index_management: i18n.translate("index-management-dashboards-plugin.indexManagement.description", {
    defaultMessage: "Manage your indexes with state polices, templates and aliases. You can also roll up or transform your indexes.",
  }),
  snapshot_management: i18n.translate("index-management-dashboards-plugin.snapshotManagement.description", {
    defaultMessage: "Back up and restore your cluster's indexes and state. Setup a policy to automate snapshot creation and deletion.",
  }),
  indexes: i18n.translate("index-management-dashboards-plugin.indexes.description", {
    defaultMessage: "Configure and manage indexes.",
  }),
  policy_managed_indexes: i18n.translate("index-management-dashboards-plugin.policyManagedIndexes.description", {
    defaultMessage: "View indexes managed by Index State Management (ISM) policies.",
  }),
  data_streams: i18n.translate("index-management-dashboards-plugin.dataStreams.description", {
    defaultMessage: "Simplify time-series data management.",
  }),
  aliases: i18n.translate("index-management-dashboards-plugin.aliases.description", {
    defaultMessage: "Organize multiple indexes under virtual index names.",
  }),
  index_state_management_policies: i18n.translate("index-management-dashboards-plugin.indexStateManagementPolicies.description", {
    defaultMessage: "Automate periodic administrative tasks.",
  }),
  index_templates: i18n.translate("index-management-dashboards-plugin.indexTemplates.description", {
    defaultMessage: "Create predefined mappings and settings for new indexes.",
  }),
  notification_settings: i18n.translate("index-management-dashboards-plugin.notificationSettings.description", {
    defaultMessage: "Set default notifications on index operation statuses.",
  }),
  rollup_jobs: i18n.translate("index-management-dashboards-plugin.rollupJobs.description", {
    defaultMessage: "Reduce data granularity by rolling up old data into summarized indexes.",
  }),
  transform_jobs: i18n.translate("index-management-dashboards-plugin.transformJobs.description", {
    defaultMessage: "Create  summarized views of your data organized by specific fields.",
  }),
  index_snapshots: i18n.translate("index-management-dashboards-plugin.indexSnapshots.description", {
    defaultMessage: "Back up your indexes.",
  }),
  snapshot_policies: i18n.translate("index-management-dashboards-plugin.snapshotPolicies.description", {
    defaultMessage: "Set up automatic data snapshots.",
  }),
  snapshot_repositories: i18n.translate("index-management-dashboards-plugin.snapshotRepositories.description", {
    defaultMessage: "Configure remote storage for snapshots.",
  }),
  component_templates: i18n.translate("index-management-dashboards-plugin.componentTemplates.description", {
    defaultMessage: "Define components for your index templates.",
  }),
});

export interface ISMPluginStartDeps {
  navigation: NavigationPublicPluginStart;
}

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
        title: "Policy-managed indexes",
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
        title: "Data streams",
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
        title: "Index aliases",
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        description: ISM_FEATURE_DESCRIPTION.aliases,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.ALIASES);
        },
      });

      // index templates route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.TEMPLATES)}`,
        title: "Index templates",
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        description: ISM_FEATURE_DESCRIPTION.index_templates,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.TEMPLATES);
        },
      });

      // component templates route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.COMPOSABLE_TEMPLATES)}`,
        title: "Component templates",
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        description: ISM_FEATURE_DESCRIPTION.component_templates,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.TEMPLATES);
        },
      });

      // notification settings route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.NOTIFICATIONS)}`,
        title: "Index operation notifications",
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
        title: "Rollup jobs",
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
        title: "Transform jobs",
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
        title: "Index snapshots",
        category: ISM_CATEGORIES.index_backup_and_recovery,
        workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
        description: ISM_FEATURE_DESCRIPTION.index_snapshots,
        updater$: this.appStateUpdater,
        mount: async (params: AppMountParameters) => {
          return mountWrapper(params, ROUTES.SNAPSHOTS);
        },
      });

      // snapshot repositories route
      core.application.register({
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.REPOSITORIES)}`,
        title: "Snapshot repositories",
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
        category: DEFAULT_APP_CATEGORIES.manageData,
        order: 200,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.MANAGED_INDICES)}`,
        category: ISM_CATEGORIES.automation_policies,
        order: 100,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.DATA_STREAMS)}`,
        category: DEFAULT_APP_CATEGORIES.manageData,
        order: 400,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.ALIASES)}`,
        category: DEFAULT_APP_CATEGORIES.manageData,
        order: 300,
      },
      {
        id: imApplicationID,
        category: ISM_CATEGORIES.automation_policies,
        title: "Index State Management policies",
        order: 200,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.TEMPLATES)}`,
        category: ISM_CATEGORIES.templates,
        order: 100,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.NOTIFICATIONS)}`,
        category: DEFAULT_APP_CATEGORIES.manageData,
        order: 500,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.ROLLUPS)}`,
        category: ISM_CATEGORIES.automation_policies,
        order: 300,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.TRANSFORMS)}`,
        category: ISM_CATEGORIES.automation_policies,
        order: 400,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.SNAPSHOTS)}`,
        category: ISM_CATEGORIES.index_backup_and_recovery,
        order: 100,
      },
      {
        id: smApplicationID,
        category: ISM_CATEGORIES.index_backup_and_recovery,
        title: "Snapshot policies",
        order: 200,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.REPOSITORIES)}`,
        category: ISM_CATEGORIES.index_backup_and_recovery,
        order: 300,
      },
      {
        id: `opensearch_index_management_dashboards_${encodeURIComponent(ROUTES.COMPOSABLE_TEMPLATES)}`,
        category: ISM_CATEGORIES.templates,
        order: 200,
      },
    ]);

    return {
      registerAction: (actionType, uiActionCtor, defaultAction) => {
        actionRepoSingleton.registerAction(actionType, uiActionCtor, defaultAction);
      },
    };
  }

  public start(core: CoreStart, { navigation }: ISMPluginStartDeps): IndexManagementPluginStart {
    Object.freeze(actionRepoSingleton.repository);
    // After this point, calling registerAction will throw error because "Object is not extensible"
    setNavigationUI(navigation.ui);
    setApplication(core.application);
    setUISettings(core.uiSettings);
    return {};
  }
}

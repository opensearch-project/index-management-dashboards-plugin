/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
// @ts-ignore
import { EuiSideNav, EuiPage, EuiPageBody, EuiPageSideBar } from "@elastic/eui";
import { CoreStart, HttpSetup, MountPoint, SavedObject } from "opensearch-dashboards/public";
import queryString from "query-string";
import semver from "semver";
import Policies from "../Policies";
import ManagedIndices from "../ManagedIndices";
import Indices from "../Indices";
import CreatePolicy from "../CreatePolicy";
import VisualCreatePolicy from "../VisualCreatePolicy";
import ChangePolicy from "../ChangePolicy";
import PolicyDetails from "../PolicyDetails/containers/PolicyDetails";
import Rollups from "../Rollups";
import { ModalProvider, ModalRoot } from "../../components/Modal";
import {
  CommonService,
  IndexService,
  ManagedIndexService,
  NotificationService,
  PolicyService,
  RollupService,
  ServicesConsumer,
  ServicesContext,
  SnapshotManagementService,
  TransformService,
} from "../../services";
import { BrowserServices } from "../../models/interfaces";
import { ROUTES } from "../../utils/constants";
import { CoreServicesConsumer } from "../../components/core_services";
import CreateRollupForm from "../CreateRollup/containers/CreateRollupForm";
import CreateTransformForm from "../CreateTransform/containers/CreateTransformForm";
import EditRollup from "../EditRollup/containers";
import RollupDetails from "../RollupDetails/containers/RollupDetails";
import { EditTransform, Transforms } from "../Transforms";
import TransformDetails from "../Transforms/containers/Transforms/TransformDetails";
import CreateSnapshotPolicy from "../CreateSnapshotPolicy";
import Repositories from "../Repositories";
import SnapshotPolicies from "../SnapshotPolicies";
import SnapshotPolicyDetails from "../SnapshotPolicyDetails";
import Snapshots from "../Snapshots";
import CreateIndex from "../CreateIndex";
import Reindex from "../Reindex/container/Reindex";
import Aliases from "../Aliases";
import Templates from "../Templates";
import CreateIndexTemplate from "../CreateIndexTemplate";
import SplitIndex from "../SplitIndex";
import IndexDetail from "../IndexDetail";
import ShrinkIndex from "../ShrinkIndex/container/ShrinkIndex";
import Rollover from "../Rollover";
import DataStreams from "../DataStreams";
import CreateDataStream from "../CreateDataStream";
import ForceMerge from "../ForceMerge";
import Notifications from "../Notifications";
import ComposableTemplates from "../ComposableTemplates";
import CreateComposableTemplate from "../CreateComposableTemplate";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../services/DataSourceMenuContext";
import {
  DataSourceManagementPluginSetup,
  DataSourceSelectableConfig,
  DataSourceViewConfig,
} from "../../../../../src/plugins/data_source_management/public";
import { DataSourceOption } from "../../../../../src/plugins/data_source_management/public/components/data_source_menu/types";
import * as pluginManifest from "../../../opensearch_dashboards.json";
import { DataSourceAttributes } from "../../../../../src/plugins/data_source/common/data_sources";
import { BehaviorSubject } from "rxjs";
import { i18n } from "@osd/i18n";
import { getUISettings } from "../../services/Services";

enum Navigation {
  IndexManagement = "Index Management",
  IndexPolicies = "State management policies",
  ManagedIndices = "Policy managed indexes",
  Indices = "Indexes",
  Rollups = "Rollup jobs",
  Transforms = "Transform jobs",
  SnapshotManagement = "Snapshot Management",
  Snapshots = "Snapshots",
  SnapshotPolicies = "Snapshot policies",
  Repositories = "Repositories",
  Aliases = "Aliases",
  Templates = "Templates",
  DataStreams = "Data streams",
  CreateDataStream = "Create data stream",
  Notifications = "Notification settings",
  ComposableTemplates = "Component templates",
}

enum Pathname {
  IndexPolicies = "/index-policies",
  ManagedIndices = "/managed-indices",
  Indices = "/indices",
  Rollups = "/rollups",
  Transforms = "/transforms",
  Snapshots = "/snapshots",
  SnapshotPolicies = "/snapshot-policies",
  Repositories = "/repositories",
}

const HIDDEN_NAV_ROUTES = [
  ROUTES.CREATE_ROLLUP,
  ROUTES.EDIT_ROLLUP,
  ROUTES.ROLLUP_DETAILS,
  ROUTES.CREATE_TRANSFORM,
  ROUTES.EDIT_TRANSFORM,
  ROUTES.TRANSFORM_DETAILS,
  ROUTES.CREATE_POLICY,
  ROUTES.EDIT_POLICY,
  ROUTES.POLICY_DETAILS,
  ROUTES.CHANGE_POLICY,
  ROUTES.SNAPSHOT_POLICY_DETAILS,
  ROUTES.CREATE_SNAPSHOT_POLICY,
  ROUTES.EDIT_SNAPSHOT_POLICY,
  ROUTES.REINDEX,
  ROUTES.CREATE_INDEX,
  ROUTES.CREATE_TEMPLATE,
  ROUTES.SPLIT_INDEX,
  ROUTES.SHRINK_INDEX,
  ROUTES.FORCE_MERGE,
  ROUTES.CREATE_DATA_STREAM,
];

const HIDDEN_NAV_STARTS_WITH_ROUTE = [
  ROUTES.CREATE_TEMPLATE,
  ROUTES.INDEX_DETAIL,
  ROUTES.ROLLOVER,
  ROUTES.CREATE_DATA_STREAM,
  ROUTES.FORCE_MERGE,
  ROUTES.CREATE_COMPOSABLE_TEMPLATE,
];

interface MainProps extends RouteComponentProps {
  landingPage: string;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
  multiDataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
}

interface MainState extends Pick<DataSourceMenuProperties, "dataSourceId"> {
  dataSourceLabel: string;
  dataSourceReadOnly: boolean;
  dataSourceLoading: boolean;
}

const dataSourceEnabledPaths: string[] = [
  ROUTES.CREATE_DATA_STREAM,
  ROUTES.CREATE_TEMPLATE,
  ROUTES.CREATE_COMPOSABLE_TEMPLATE,
  ROUTES.FORCE_MERGE,
  ROUTES.SPLIT_INDEX,
  ROUTES.ROLLOVER,
  ROUTES.INDEX_DETAIL,
  ROUTES.INDEX_POLICIES,
  ROUTES.MANAGED_INDICES,
  ROUTES.CREATE_POLICY,
  ROUTES.EDIT_POLICY,
  ROUTES.CHANGE_POLICY,
  ROUTES.POLICY_DETAILS,
  ROUTES.INDICES,
  ROUTES.CREATE_INDEX,
  ROUTES.ALIASES,
  ROUTES.DATA_STREAMS,
  ROUTES.TEMPLATES,
  ROUTES.CREATE_DATA_STREAM,
  ROUTES.CREATE_TEMPLATE,
  ROUTES.COMPOSABLE_TEMPLATES,
  ROUTES.CREATE_COMPOSABLE_TEMPLATE,
  ROUTES.REINDEX,
  ROUTES.ROLLUPS,
  ROUTES.CREATE_ROLLUP,
  ROUTES.EDIT_ROLLUP,
  ROUTES.ROLLUP_DETAILS,
  ROUTES.TRANSFORMS,
  ROUTES.CREATE_TRANSFORM,
  ROUTES.EDIT_TRANSFORM,
  ROUTES.TRANSFORM_DETAILS,
  ROUTES.SNAPSHOT_POLICIES,
  ROUTES.SNAPSHOT_POLICY_DETAILS,
  ROUTES.CREATE_SNAPSHOT_POLICY,
  ROUTES.EDIT_SNAPSHOT_POLICY,
  ROUTES.SNAPSHOTS,
  ROUTES.CREATE_SNAPSHOT,
  ROUTES.EDIT_SNAPSHOT,
  ROUTES.REPOSITORIES,
  ROUTES.CREATE_REPOSITORY,
  ROUTES.EDIT_REPOSITORY,
  ROUTES.NOTIFICATIONS,
];

const LocalCluster: DataSourceOption = {
  label: i18n.translate("dataSource.localCluster", {
    defaultMessage: "Local cluster",
  }),
  id: "",
};

export const dataSourceObservable = new BehaviorSubject<DataSourceOption>(LocalCluster);

export default class Main extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    let dataSourceId = "";
    let dataSourceLabel = "";
    if (props.multiDataSourceEnabled) {
      const { dataSourceId: parsedDataSourceId, dataSourceLabel: parsedDataSourceLabel } = queryString.parse(
        this.props.location.search
      ) as {
        dataSourceId: string;
        dataSourceLabel: string;
      };
      dataSourceId = parsedDataSourceId;
      dataSourceLabel = parsedDataSourceLabel || "";

      if (dataSourceId) {
        dataSourceObservable.next({ id: dataSourceId, label: dataSourceLabel });
      }
    }
    this.state = {
      dataSourceId,
      dataSourceLabel,
      dataSourceReadOnly: false,
      /**
       * undefined: need data source picker to help to determine which data source to use.
       * empty string: using the local cluster.
       * string: using the selected data source.
       */
      dataSourceLoading: dataSourceId === undefined ? props.multiDataSourceEnabled : false,
    };
  }

  setDataSourceReadOnly = (readonly: boolean) => {
    this.setState({ dataSourceReadOnly: readonly });
  };

  isDataSourceEnabledForPath(path: string): boolean {
    return dataSourceEnabledPaths.some((dataSourceEnabledPath: string) => path.startsWith(dataSourceEnabledPath));
  }

  getServices(http: HttpSetup) {
    const {
      location: { pathname },
    } = this.props;
    const indexService = new IndexService(http);
    const managedIndexService = new ManagedIndexService(http);
    const policyService = new PolicyService(http);
    const rollupService = new RollupService(http);
    const transformService = new TransformService(http);
    const notificationService = new NotificationService(http);
    const snapshotManagementService = new SnapshotManagementService(http);
    const commonService = new CommonService(http);
    const services = {
      indexService,
      managedIndexService,
      policyService,
      rollupService,
      transformService,
      notificationService,
      snapshotManagementService,
      commonService,
    };

    if (this.props.multiDataSourceEnabled && this.isDataSourceEnabledForPath(pathname)) {
      services.indexService = new IndexService(http, this.state.dataSourceId, this.props.multiDataSourceEnabled);
      services.commonService = new CommonService(http, this.state.dataSourceId, this.props.multiDataSourceEnabled);
      services.managedIndexService = new ManagedIndexService(http, this.state.dataSourceId, this.props.multiDataSourceEnabled);
      services.policyService = new PolicyService(http, this.state.dataSourceId, this.props.multiDataSourceEnabled);
      services.notificationService = new NotificationService(http, this.state.dataSourceId, this.props.multiDataSourceEnabled);
      services.rollupService = new RollupService(http, this.state.dataSourceId, this.props.multiDataSourceEnabled);
      services.transformService = new TransformService(http, this.state.dataSourceId, this.props.multiDataSourceEnabled);
      services.snapshotManagementService = new SnapshotManagementService(http, this.state.dataSourceId, this.props.multiDataSourceEnabled);
    }
    return services;
  }

  onSelectedDataSources = (dataSources: DataSourceOption[]) => {
    const { id = "", label = "" } = dataSources[0] || {};
    if (this.state.dataSourceId !== id || this.state.dataSourceLabel !== label) {
      this.setState({
        dataSourceId: id,
        dataSourceLabel: label,
      });
      dataSourceObservable.next({ id, label });
    }
    if (this.state.dataSourceLoading) {
      this.setState({
        dataSourceLoading: false,
      });
    }
  };

  dataSourceFilterFn = (dataSource: SavedObject<DataSourceAttributes>) => {
    const engineVersion = dataSource?.attributes?.dataSourceVersion || "";
    const availablePlugins = dataSource?.attributes?.installedPlugins || [];
    return (
      semver.satisfies(engineVersion, pluginManifest.supportedOSDataSourceVersions) &&
      pluginManifest.requiredOSDataSourcePlugins.every((plugin) => availablePlugins.includes(plugin))
    );
  };

  render() {
    const {
      location: { pathname },
    } = this.props;
    const sideNav = [
      {
        name: Navigation.IndexManagement,
        id: 0,
        href: `#${Pathname.IndexPolicies}`,
        items: [
          {
            name: Navigation.IndexPolicies,
            id: 1,
            href: `#${Pathname.IndexPolicies}`,
            isSelected: pathname === Pathname.IndexPolicies,
          },
          {
            name: Navigation.ManagedIndices,
            id: 2,
            href: `#${Pathname.ManagedIndices}`,
            isSelected: pathname === Pathname.ManagedIndices,
          },
          {
            name: Navigation.Indices,
            id: 3,
            href: `#${Pathname.Indices}`,
            isSelected: [Pathname.Indices, ROUTES.CREATE_INDEX].includes(pathname as Pathname),
          },
          {
            name: Navigation.DataStreams,
            id: 8,
            href: `#${ROUTES.DATA_STREAMS}`,
            isSelected: ROUTES.DATA_STREAMS === pathname,
          },
          {
            name: Navigation.Templates,
            id: 7,
            href: `#${ROUTES.TEMPLATES}`,
            isSelected: ROUTES.TEMPLATES === pathname,
            items: [
              {
                name: Navigation.ComposableTemplates,
                id: 9,
                href: `#${ROUTES.COMPOSABLE_TEMPLATES}`,
                isSelected: ROUTES.COMPOSABLE_TEMPLATES === pathname,
              },
            ],
          },
          {
            name: Navigation.Aliases,
            id: 6,
            href: `#${ROUTES.ALIASES}`,
            isSelected: ROUTES.ALIASES === pathname,
          },
          {
            name: Navigation.Rollups,
            id: 4,
            href: `#${Pathname.Rollups}`,
            isSelected: pathname === Pathname.Rollups,
          },
          {
            name: Navigation.Transforms,
            id: 5,
            href: `#${Pathname.Transforms}`,
            isSelected: pathname === Pathname.Transforms,
          },
          {
            name: Navigation.Notifications,
            id: 10,
            href: `#${ROUTES.NOTIFICATIONS}`,
            isSelected: pathname === ROUTES.NOTIFICATIONS,
          },
        ],
      },
      {
        name: Navigation.SnapshotManagement,
        id: 1,
        href: `#${Pathname.SnapshotPolicies}`,
        items: [
          {
            name: Navigation.SnapshotPolicies,
            id: 1,
            href: `#${Pathname.SnapshotPolicies}`,
            isSelected: pathname === Pathname.SnapshotPolicies,
          },
          {
            name: Navigation.Snapshots,
            id: 2,
            href: `#${Pathname.Snapshots}`,
            isSelected: pathname === Pathname.Snapshots,
          },
          {
            name: Navigation.Repositories,
            id: 3,
            href: `#${Pathname.Repositories}`,
            isSelected: pathname === Pathname.Repositories,
          },
        ],
      },
    ];

    const { landingPage } = this.props;

    const uiSettings = getUISettings();
    const showActionsInHeader = uiSettings.get("home:useNewHomePage");
    const ROUTE_STYLE = showActionsInHeader ? { padding: "0px 0px" } : { padding: "25px 25px" };

    const DataSourceMenu = this.props.dataSourceManagement?.ui?.getDataSourceMenu<DataSourceSelectableConfig>();
    const DataSourceViewer = this.props.dataSourceManagement?.ui?.getDataSourceMenu<DataSourceViewConfig>();
    const activeOption: DataSourceOption[] | undefined = this.state.dataSourceLoading
      ? undefined
      : [
          {
            label: this.state.dataSourceLabel,
            id: this.state.dataSourceId,
          },
        ];

    return (
      <CoreServicesConsumer>
        {(core: CoreStart | null) =>
          core && (
            <ServicesContext.Provider value={this.getServices(core.http)}>
              <ServicesConsumer>
                {(services: BrowserServices | null) =>
                  services && (
                    <ModalProvider>
                      <DataSourceMenuContext.Provider
                        value={{
                          dataSourceId: this.state.dataSourceId,
                          multiDataSourceEnabled: this.props.multiDataSourceEnabled,
                        }}
                      >
                        {this.props.multiDataSourceEnabled && DataSourceMenu && DataSourceViewer && (
                          <Switch>
                            <Route
                              path={[ROUTES.CREATE_ROLLUP, ROUTES.CREATE_TRANSFORM]}
                              render={() =>
                                this.state.dataSourceReadOnly ? (
                                  <DataSourceViewer
                                    setMenuMountPoint={this.props.setActionMenu}
                                    componentType={"DataSourceView"}
                                    componentConfig={{
                                      activeOption,
                                      fullWidth: false,
                                      dataSourceFilter: this.dataSourceFilterFn,
                                    }}
                                  />
                                ) : (
                                  <DataSourceMenu
                                    setMenuMountPoint={this.props.setActionMenu}
                                    componentType={"DataSourceSelectable"}
                                    componentConfig={{
                                      savedObjects: core?.savedObjects.client,
                                      notifications: core?.notifications,
                                      fullWidth: false,
                                      activeOption,
                                      onSelectedDataSources: this.onSelectedDataSources,
                                      dataSourceFilter: this.dataSourceFilterFn,
                                    }}
                                  />
                                )
                              }
                            />
                            <Route
                              path={[
                                `${ROUTES.CREATE_DATA_STREAM}/:dataStream`,
                                `${ROUTES.CREATE_TEMPLATE}/:template`,
                                `${ROUTES.CREATE_COMPOSABLE_TEMPLATE}/:composableTemplate`,
                                ROUTES.FORCE_MERGE,
                                ROUTES.SPLIT_INDEX,
                                ROUTES.ROLLOVER,
                                ROUTES.INDEX_DETAIL,
                                ROUTES.EDIT_POLICY,
                                ROUTES.POLICY_DETAILS,
                                ROUTES.REINDEX,
                                ROUTES.EDIT_ROLLUP,
                                ROUTES.ROLLUP_DETAILS,
                                ROUTES.TRANSFORM_DETAILS,
                                ROUTES.EDIT_TRANSFORM,
                                ROUTES.EDIT_SNAPSHOT_POLICY,
                                ROUTES.SNAPSHOT_POLICY_DETAILS,
                              ]}
                              render={() => (
                                <DataSourceViewer
                                  setMenuMountPoint={this.props.setActionMenu}
                                  componentType={"DataSourceView"}
                                  componentConfig={{
                                    activeOption,
                                    fullWidth: false,
                                    dataSourceFilter: this.dataSourceFilterFn,
                                  }}
                                />
                              )}
                            />
                            <Route
                              path={[
                                ROUTES.INDICES,
                                ROUTES.CREATE_INDEX,
                                ROUTES.ALIASES,
                                ROUTES.DATA_STREAMS,
                                ROUTES.TEMPLATES,
                                ROUTES.CREATE_DATA_STREAM,
                                ROUTES.CREATE_TEMPLATE,
                                ROUTES.COMPOSABLE_TEMPLATES,
                                ROUTES.CREATE_COMPOSABLE_TEMPLATE,
                                ROUTES.MANAGED_INDICES,
                                ROUTES.INDEX_POLICIES,
                                ROUTES.CREATE_POLICY,
                                ROUTES.CHANGE_POLICY,
                                ROUTES.ROLLUPS,
                                ROUTES.TRANSFORMS,
                                ROUTES.SNAPSHOT_POLICIES,
                                ROUTES.SNAPSHOT_POLICY_DETAILS,
                                ROUTES.CREATE_SNAPSHOT_POLICY,
                                ROUTES.EDIT_SNAPSHOT_POLICY,
                                ROUTES.SNAPSHOTS,
                                ROUTES.CREATE_SNAPSHOT,
                                ROUTES.EDIT_SNAPSHOT,
                                ROUTES.REPOSITORIES,
                                ROUTES.CREATE_REPOSITORY,
                                ROUTES.EDIT_REPOSITORY,
                                ROUTES.NOTIFICATIONS,
                              ]}
                              render={() => (
                                <DataSourceMenu
                                  setMenuMountPoint={this.props.setActionMenu}
                                  componentType={"DataSourceSelectable"}
                                  componentConfig={{
                                    savedObjects: core?.savedObjects.client,
                                    notifications: core?.notifications,
                                    fullWidth: false,
                                    activeOption,
                                    onSelectedDataSources: this.onSelectedDataSources,
                                    dataSourceFilter: this.dataSourceFilterFn,
                                  }}
                                />
                              )}
                            />
                            <Redirect from="/" to={landingPage} />
                          </Switch>
                        )}
                        {!this.state.dataSourceLoading && (
                          <>
                            <ModalRoot services={services} />
                            <EuiPage restrictWidth="100%">
                              {/* Hide side navigation bar when creating or editing rollup job*/}
                              {!core.chrome.navGroup.getNavGroupEnabled() &&
                              !HIDDEN_NAV_ROUTES.includes(pathname) &&
                              !HIDDEN_NAV_STARTS_WITH_ROUTE.some((item) => pathname.startsWith(item)) ? (
                                <EuiPageSideBar style={{ minWidth: 200 }}>
                                  <EuiSideNav style={{ width: 200 }} items={sideNav} />
                                </EuiPageSideBar>
                              ) : null}
                              <EuiPageBody>
                                <Switch>
                                  <Route
                                    path={ROUTES.SNAPSHOTS}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <Snapshots
                                          {...props}
                                          snapshotManagementService={services.snapshotManagementService}
                                          indexService={services.indexService}
                                        />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.REPOSITORIES}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <Repositories {...props} snapshotManagementService={services.snapshotManagementService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.SNAPSHOT_POLICIES}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <SnapshotPolicies {...props} snapshotManagementService={services.snapshotManagementService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.SNAPSHOT_POLICY_DETAILS}
                                    render={(props: RouteComponentProps) => (
                                      <SnapshotPolicyDetails
                                        {...props}
                                        snapshotManagementService={services.snapshotManagementService}
                                        notificationService={services.notificationService}
                                      />
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.CREATE_SNAPSHOT_POLICY}
                                    render={(props: RouteComponentProps) => (
                                      <CreateSnapshotPolicy
                                        {...props}
                                        snapshotManagementService={services.snapshotManagementService}
                                        notificationService={services.notificationService}
                                        indexService={services.indexService}
                                        isEdit={false}
                                      />
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.EDIT_SNAPSHOT_POLICY}
                                    render={(props: RouteComponentProps) => (
                                      <CreateSnapshotPolicy
                                        {...props}
                                        snapshotManagementService={services.snapshotManagementService}
                                        notificationService={services.notificationService}
                                        indexService={services.indexService}
                                        isEdit={true}
                                      />
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.CHANGE_POLICY}
                                    render={(props: RouteComponentProps) => (
                                      <ChangePolicy
                                        {...props}
                                        managedIndexService={services.managedIndexService}
                                        indexService={services.indexService}
                                      />
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.CREATE_POLICY}
                                    render={(props: RouteComponentProps) =>
                                      queryString.parse(this.props.location.search).type == "visual" ? (
                                        <VisualCreatePolicy
                                          {...props}
                                          isEdit={false}
                                          policyService={services.policyService}
                                          notificationService={services.notificationService}
                                        />
                                      ) : (
                                        <CreatePolicy {...props} isEdit={false} policyService={services.policyService} />
                                      )
                                    }
                                  />
                                  <Route
                                    path={ROUTES.EDIT_POLICY}
                                    render={(props: RouteComponentProps) =>
                                      queryString.parse(this.props.location.search).type == "visual" ? (
                                        <VisualCreatePolicy
                                          {...props}
                                          isEdit={true}
                                          policyService={services.policyService}
                                          notificationService={services.notificationService}
                                        />
                                      ) : (
                                        <CreatePolicy {...props} isEdit={true} policyService={services.policyService} />
                                      )
                                    }
                                  />
                                  <Route
                                    path={ROUTES.INDEX_POLICIES}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <Policies {...props} policyService={services.policyService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.POLICY_DETAILS}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <PolicyDetails {...props} policyService={services.policyService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.MANAGED_INDICES}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <ManagedIndices {...props} managedIndexService={services.managedIndexService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.INDICES}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <Indices {...props} indexService={services.indexService} commonService={services.commonService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.ROLLUPS}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <Rollups {...props} rollupService={services.rollupService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.CREATE_ROLLUP}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateRollupForm
                                          {...props}
                                          rollupService={services.rollupService}
                                          indexService={services.indexService}
                                          dataSourceReadOnly={this.state.dataSourceReadOnly}
                                          setDataSourceReadOnly={this.setDataSourceReadOnly}
                                        />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.EDIT_ROLLUP}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <EditRollup {...props} rollupService={services.rollupService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.ROLLUP_DETAILS}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <RollupDetails {...props} rollupService={services.rollupService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.TRANSFORMS}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <Transforms {...props} transformService={services.transformService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.CREATE_TRANSFORM}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateTransformForm
                                          {...props}
                                          rollupService={services.rollupService}
                                          transformService={services.transformService}
                                          indexService={services.indexService}
                                          dataSourceReadOnly={this.state.dataSourceReadOnly}
                                          setDataSourceReadOnly={this.setDataSourceReadOnly}
                                        />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.EDIT_TRANSFORM}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <EditTransform {...props} transformService={services.transformService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.TRANSFORM_DETAILS}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <TransformDetails {...props} transformService={services.transformService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={`${ROUTES.CREATE_INDEX}/:index/:mode`}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateIndex {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={`${ROUTES.CREATE_INDEX}/:index`}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateIndex {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.CREATE_INDEX}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateIndex {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.REINDEX}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <Reindex {...props} commonService={services.commonService} indexService={services.indexService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.SPLIT_INDEX}
                                    render={(props: RouteComponentProps) => (
                                      <div style={ROUTE_STYLE}>
                                        <SplitIndex {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.ALIASES}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <Aliases {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.TEMPLATES}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <Templates {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.COMPOSABLE_TEMPLATES}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <ComposableTemplates {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={`${ROUTES.CREATE_COMPOSABLE_TEMPLATE}/:template/:mode`}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateComposableTemplate {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={`${ROUTES.CREATE_COMPOSABLE_TEMPLATE}/:template`}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateComposableTemplate {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.CREATE_COMPOSABLE_TEMPLATE}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateComposableTemplate {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={`${ROUTES.CREATE_TEMPLATE}/:template/:mode`}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateIndexTemplate {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={`${ROUTES.CREATE_TEMPLATE}/:template`}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateIndexTemplate {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.CREATE_TEMPLATE}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateIndexTemplate {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={`${ROUTES.INDEX_DETAIL}/:index`}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <IndexDetail {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.SHRINK_INDEX}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <ShrinkIndex {...props} commonService={services.commonService} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={`${ROUTES.ROLLOVER}/:source`}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <Rollover {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.ROLLOVER}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <Rollover {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.DATA_STREAMS}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <DataStreams {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={`${ROUTES.CREATE_DATA_STREAM}/:dataStream`}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateDataStream {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.CREATE_DATA_STREAM}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <CreateDataStream {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={`${ROUTES.FORCE_MERGE}/:indexes`}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <ForceMerge {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.FORCE_MERGE}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <ForceMerge {...props} />
                                      </div>
                                    )}
                                  />
                                  <Route
                                    path={ROUTES.NOTIFICATIONS}
                                    render={(props) => (
                                      <div style={ROUTE_STYLE}>
                                        <Notifications {...props} />
                                      </div>
                                    )}
                                  />
                                  <Redirect from="/" to={landingPage} />
                                </Switch>
                              </EuiPageBody>
                            </EuiPage>
                          </>
                        )}
                      </DataSourceMenuContext.Provider>
                    </ModalProvider>
                  )
                }
              </ServicesConsumer>
            </ServicesContext.Provider>
          )
        }
      </CoreServicesConsumer>
    );
  }
}

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
// @ts-ignore
import { EuiSideNav, EuiPage, EuiPageBody, EuiPageSideBar } from "@elastic/eui";
import { CoreStart } from "opensearch-dashboards/public";
import Policies from "../Policies";
import ManagedIndices from "../ManagedIndices";
import Indices from "../Indices";
import CreatePolicy from "../CreatePolicy";
import VisualCreatePolicy from "../VisualCreatePolicy";
import ChangePolicy from "../ChangePolicy";
import PolicyDetails from "../PolicyDetails/containers/PolicyDetails";
import Rollups from "../Rollups";
import { ModalProvider, ModalRoot } from "../../components/Modal";
import { ServicesConsumer } from "../../services";
import { BrowserServices } from "../../models/interfaces";
import { ROUTES } from "../../utils/constants";
import { CoreServicesConsumer } from "../../components/core_services";
import CreateRollupForm from "../CreateRollup/containers/CreateRollupForm";
import CreateTransformForm from "../CreateTransform/containers/CreateTransformForm";
import EditRollup from "../EditRollup/containers";
import RollupDetails from "../RollupDetails/containers/RollupDetails";
import { EditTransform, Transforms } from "../Transforms";
import TransformDetails from "../Transforms/containers/Transforms/TransformDetails";
import queryString from "query-string";

enum Navigation {
  IndexManagement = "Index Management",
  IndexPolicies = "Index Policies",
  ManagedIndices = "Managed Indices",
  Indices = "Indices",
  Rollups = "Rollup Jobs",
  Transforms = "Transform Jobs",
}

enum Pathname {
  IndexPolicies = "/index-policies",
  ManagedIndices = "/managed-indices",
  Indices = "/indices",
  Rollups = "/rollups",
  Transforms = "/transforms",
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
];

interface MainProps extends RouteComponentProps {}

export default class Main extends Component<MainProps, object> {
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
            isSelected: pathname === Pathname.Indices,
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
        ],
      },
    ];
    return (
      <CoreServicesConsumer>
        {(core: CoreStart | null) =>
          core && (
            <ServicesConsumer>
              {(services: BrowserServices | null) =>
                services && (
                  <ModalProvider>
                    <ModalRoot services={services} />
                    <EuiPage restrictWidth="100%">
                      {/*Hide side navigation bar when creating or editing rollup job*/}
                      {!HIDDEN_NAV_ROUTES.includes(pathname) && (
                        <EuiPageSideBar style={{ minWidth: 150 }}>
                          <EuiSideNav style={{ width: 150 }} items={sideNav} />
                        </EuiPageSideBar>
                      )}
                      <EuiPageBody>
                        <Switch>
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
                                <VisualCreatePolicy {...props} isEdit={false} policyService={services.policyService} />
                              ) : (
                                <CreatePolicy {...props} isEdit={false} policyService={services.policyService} />
                              )
                            }
                          />
                          <Route
                            path={ROUTES.EDIT_POLICY}
                            render={(props: RouteComponentProps) =>
                              queryString.parse(this.props.location.search).type == "visual" ? (
                                <VisualCreatePolicy {...props} isEdit={true} policyService={services.policyService} />
                              ) : (
                                <CreatePolicy {...props} isEdit={true} policyService={services.policyService} />
                              )
                            }
                          />
                          <Route
                            path={ROUTES.INDEX_POLICIES}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <Policies {...props} policyService={services.policyService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.POLICY_DETAILS}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <PolicyDetails {...props} policyService={services.policyService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.MANAGED_INDICES}
                            render={(props: RouteComponentProps) => (
                              <div>
                                <ManagedIndices {...props} managedIndexService={services.managedIndexService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.INDICES}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <Indices {...props} indexService={services.indexService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.ROLLUPS}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <Rollups {...props} rollupService={services.rollupService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.CREATE_ROLLUP}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <CreateRollupForm {...props} rollupService={services.rollupService} indexService={services.indexService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.EDIT_ROLLUP}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <EditRollup {...props} rollupService={services.rollupService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.ROLLUP_DETAILS}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <RollupDetails {...props} rollupService={services.rollupService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.TRANSFORMS}
                            render={(props: RouteComponentProps) => (
                              <div>
                                <Transforms {...props} transformService={services.transformService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.CREATE_TRANSFORM}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <CreateTransformForm
                                  {...props}
                                  rollupService={services.rollupService}
                                  transformService={services.transformService}
                                  indexService={services.indexService}
                                />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.EDIT_TRANSFORM}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <EditTransform {...props} transformService={services.transformService} />
                              </div>
                            )}
                          />
                          <Route
                            path={ROUTES.TRANSFORM_DETAILS}
                            render={(props: RouteComponentProps) => (
                              <div style={{ padding: "25px 25px" }}>
                                <TransformDetails {...props} transformService={services.transformService} />
                              </div>
                            )}
                          />
                          <Redirect from="/" to={ROUTES.INDEX_POLICIES} />
                        </Switch>
                      </EuiPageBody>
                    </EuiPage>
                  </ModalProvider>
                )
              }
            </ServicesConsumer>
          )
        }
      </CoreServicesConsumer>
    );
  }
}

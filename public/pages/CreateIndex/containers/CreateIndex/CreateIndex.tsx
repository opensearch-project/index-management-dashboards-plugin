/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import { EuiSpacer, EuiTitle } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import IndexForm from "../IndexForm";
import { BREADCRUMBS, IndicesUpdateMode, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";
import { getUISettings } from "../../../../services/Services";

interface CreateIndexPropsBase extends RouteComponentProps<{ index?: string; mode?: IndicesUpdateMode }> {
  isEdit?: boolean;
  useUpdatedUX?: boolean;
}

interface CreateIndexProps extends CreateIndexPropsBase, DataSourceMenuProperties {}

export class CreateIndex extends Component<CreateIndexProps> {
  static contextType = CoreServicesContext;

  get index() {
    return this.props.match.params.index;
  }

  get isEdit() {
    return this.props.match.params.index !== undefined;
  }

  componentDidMount = async (): Promise<void> => {
    const isEdit = this.isEdit;
    const breadCrumbs = this.props.useUpdatedUX
      ? [BREADCRUMBS.INDICES, isEdit ? BREADCRUMBS.EDIT_INDEX : BREADCRUMBS.CREATE_INDEX]
      : [BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDICES, isEdit ? BREADCRUMBS.EDIT_INDEX : BREADCRUMBS.CREATE_INDEX];
    this.context.chrome.setBreadcrumbs(breadCrumbs);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.INDICES);
  };

  render() {
    const isEdit = this.isEdit;

    return this.props.useUpdatedUX ? (
      <div style={{ padding: "0px 0px" }}>
        <IndexForm
          index={this.index}
          mode={this.props.match.params.mode}
          onCancel={this.onCancel}
          onSubmitSuccess={() => this.props.history.push(ROUTES.INDICES)}
          dataSourceId={this.props.dataSourceId}
          useUpdatedUX={this.props.useUpdatedUX}
        />
      </div>
    ) : (
      <div style={{ padding: "0px 50px" }}>
        <EuiTitle size="l">
          <h1>{isEdit ? "Edit" : "Create"} index</h1>
        </EuiTitle>
        <EuiSpacer />
        <IndexForm
          index={this.index}
          mode={this.props.match.params.mode}
          onCancel={this.onCancel}
          onSubmitSuccess={() => this.props.history.push(ROUTES.INDICES)}
          dataSourceId={this.props.dataSourceId}
          useUpdatedUX={this.props.useUpdatedUX}
        />
      </div>
    );
  }
}

export default function (props: CreateIndexPropsBase) {
  const dataSourceMenuProperties = useContext(DataSourceMenuContext);
  useUpdateUrlWithDataSourceProperties();
  const uiSettings = getUISettings();
  const useUpdatedUX = uiSettings.get("home:useNewHomePage");
  return <CreateIndex {...props} {...dataSourceMenuProperties} useUpdatedUX={useUpdatedUX} />;
}

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import { EuiSpacer, EuiText } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import IndexForm from "../IndexForm";
import { BREADCRUMBS, IndicesUpdateMode, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";

interface CreateIndexPropsBase extends RouteComponentProps<{ index?: string; mode?: IndicesUpdateMode }> {
  isEdit?: boolean;
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
    this.context.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      isEdit ? BREADCRUMBS.EDIT_INDEX : BREADCRUMBS.CREATE_INDEX,
    ]);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.INDICES);
  };

  render() {
    const isEdit = this.isEdit;

    return (
      <div style={{ padding: "0px 50px" }}>
        <EuiText size="s">
          <h1>{isEdit ? "Edit" : "Create"} index</h1>
        </EuiText>
        <EuiSpacer />
        <IndexForm
          index={this.index}
          mode={this.props.match.params.mode}
          onCancel={this.onCancel}
          onSubmitSuccess={() => this.props.history.push(ROUTES.INDICES)}
          dataSourceId={this.props.dataSourceId}
        />
      </div>
    );
  }
}

export default function (props: CreateIndexPropsBase) {
  const dataSourceMenuProperties = useContext(DataSourceMenuContext);
  useUpdateUrlWithDataSourceProperties();
  return <CreateIndex {...props} {...dataSourceMenuProperties} />;
}

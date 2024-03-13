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
import { CommonService } from "../../../../services/index";
import { DataSourceMenuContext } from "../../../../services/DataSourceMenuContext";
import queryString from "query-string";

interface CreateIndexProps extends RouteComponentProps<{ index?: string; mode?: IndicesUpdateMode }> {
  isEdit?: boolean;
  commonService: CommonService;
  dataSourceId: string;
  dataSourceLabel: string;
  multiDataSourceEnabled: boolean;
}

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

  componentDidUpdate(prevProps: Readonly<CreateIndexProps>) {
    if (this.props.multiDataSourceEnabled) {
      if (prevProps.dataSourceId !== this.props.dataSourceId || prevProps.dataSourceLabel !== this.props.dataSourceLabel) {
        this.props.history.replace({
          search: queryString.stringify({
            dataSourceId: this.props.dataSourceId,
            dataSourceLabel: this.props.dataSourceLabel,
          }),
        });
      }
    }
  }

  render() {
    const isEdit = this.isEdit;

    return (
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
        />
      </div>
    );
  }
}

export default function (props: CreateIndexProps) {
  const dataSourceMenuProperties = useContext(DataSourceMenuContext);
  return (
    <CreateIndex
      {...props}
      dataSourceId={dataSourceMenuProperties.dataSourceId}
      dataSourceLabel={dataSourceMenuProperties.dataSourceLabel}
      multiDataSourceEnabled={dataSourceMenuProperties.multiDataSourceEnabled}
    />
  );
}

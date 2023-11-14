/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import React, { Component } from "react";
import { EuiSpacer, EuiTitle } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import IndexForm from "../IndexForm";
import { BREADCRUMBS, IndicesUpdateMode, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { CommonService } from "../../../../services/index";

interface CreateIndexProps extends RouteComponentProps<{ index?: string; mode?: IndicesUpdateMode }> {
  isEdit?: boolean;
  commonService: CommonService;
}

export default class CreateIndex extends Component<CreateIndexProps> {
  static contextType = CoreServicesContext;

  public get index() {
    return this.props.match.params.index;
  }

  public get isEdit() {
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
        <EuiTitle size="l">
          <h1>{isEdit ? "Edit" : "Create"} index</h1>
        </EuiTitle>
        <EuiSpacer />
        <IndexForm
          index={this.index}
          mode={this.props.match.params.mode}
          onCancel={this.onCancel}
          onSubmitSuccess={() => this.props.history.push(ROUTES.INDICES)}
        />
      </div>
    );
  }
}

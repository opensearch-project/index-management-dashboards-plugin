/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import TemplateDetail from "../TemplateDetail";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import CustomFormRow from "../../../../components/CustomFormRow";

interface CreateIndexTemplateProps extends RouteComponentProps<{ template?: string; mode?: string }> {}

export default class CreateIndexTemplate extends Component<CreateIndexTemplateProps> {
  static contextType = CoreServicesContext;

  get template() {
    return this.props.match.params.template;
  }

  get isEdit() {
    return this.props.match.params.template !== undefined;
  }

  get readonly() {
    return this.props.match.params.mode === "readonly";
  }

  componentDidMount = async (): Promise<void> => {
    const isEdit = this.isEdit;
    this.context.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.TEMPLATES,
      isEdit
        ? {
            ...BREADCRUMBS.EDIT_TEMPLATE,
            href: `#${this.props.location.pathname}`,
          }
        : BREADCRUMBS.CREATE_TEMPLATE,
    ]);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.TEMPLATES);
  };

  render() {
    const isEdit = this.isEdit;

    return (
      <div style={{ padding: "0px 50px" }}>
        <EuiTitle size="l">
          <h1>{isEdit ? "Edit" : "Create"} template</h1>
        </EuiTitle>
        <CustomFormRow
          fullWidth
          label=""
          helpText={
            <div>
              Index templates let you initialize new indexes with predefined mappings and settings.{" "}
              <EuiLink external target="_blank" href="https://opensearch.org/docs/latest/opensearch/index-templates">
                Learn more
              </EuiLink>
            </div>
          }
        >
          <></>
        </CustomFormRow>
        <EuiSpacer />
        <TemplateDetail
          readonly={this.readonly}
          templateName={this.template}
          onCancel={this.onCancel}
          onSubmitSuccess={() => this.props.history.push(ROUTES.TEMPLATES)}
        />
      </div>
    );
  }
}

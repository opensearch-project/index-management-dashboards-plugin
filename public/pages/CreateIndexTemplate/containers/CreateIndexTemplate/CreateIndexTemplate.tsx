/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import { EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import TemplateForm from "../TemplateForm";
import { BREADCRUMBS, IndicesUpdateMode, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { CommonService, ServicesContext } from "../../../../services/index";
import CustomFormRow from "../../../../components/CustomFormRow";

interface CreateIndexTemplateProps extends RouteComponentProps<{ index?: string; mode?: IndicesUpdateMode }> {
  isEdit?: boolean;
  commonService: CommonService;
}

export class CreateIndexTemplate extends Component<CreateIndexTemplateProps> {
  static contextType = CoreServicesContext;

  get commonService() {
    return this.props.commonService;
  }

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
        <TemplateForm
          index={this.index}
          commonService={this.commonService}
          mode={this.props.match.params.mode}
          onCancel={this.onCancel}
          onSubmitSuccess={() => this.props.history.push(ROUTES.TEMPLATES)}
        />
      </div>
    );
  }
}

export default function CreateIndexTemplateWrapper(props: Omit<CreateIndexTemplateProps, "commonService">) {
  const services = useContext(ServicesContext);
  return <CreateIndexTemplate {...props} commonService={services?.commonService as CommonService} />;
}

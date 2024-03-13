/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import TemplateDetail from "../TemplateDetail";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { isEqual } from "lodash";
import queryString from "query-string";
import { DataSourceMenuContext } from "../../../../services/DataSourceMenuContext";

interface CreateComposableTemplateProps extends RouteComponentProps<{ template?: string; mode?: string }> {
  dataSourceId: string;
  dataSourceLabel: string;
  multiDataSourceEnabled: boolean;
}

class CreateComposableTemplate extends Component<CreateComposableTemplateProps> {
  static contextType = CoreServicesContext;

  get template() {
    return this.props.match.params.template;
  }

  get readonly() {
    return this.props.match.params.mode === "readonly";
  }

  setBreadCrumb() {
    const isEdit = this.template;
    const readonly = this.readonly;
    let lastBread: typeof BREADCRUMBS.CREATE_COMPOSABLE_TEMPLATE;
    if (readonly && this.template) {
      lastBread = {
        text: this.template,
        href: `#${this.props.location.pathname}`,
      };
    } else if (isEdit) {
      lastBread = {
        text: this.template as string,
        href: `#${this.props.location.pathname}`,
      };
    } else {
      lastBread = BREADCRUMBS.CREATE_COMPOSABLE_TEMPLATE;
    }
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.COMPOSABLE_TEMPLATES, lastBread]);
  }

  updateDataSourcePropsInUrl() {
    if (this.props.multiDataSourceEnabled) {
      this.props.history.replace({
        ...this.props.location,
        search: queryString.stringify({
          dataSourceId: this.props.dataSourceId,
          dataSourceLabel: this.props.dataSourceLabel,
        }),
      });
    }
  }

  componentDidUpdate(prevProps: Readonly<CreateComposableTemplateProps>): void {
    if (!isEqual(prevProps, this.props)) {
      this.setBreadCrumb();
      this.updateDataSourcePropsInUrl();
    }
  }

  componentDidMount = async (): Promise<void> => {
    this.setBreadCrumb();
    this.updateDataSourcePropsInUrl();
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.COMPOSABLE_TEMPLATES);
  };

  render() {
    return (
      <div style={{ padding: "0px 50px" }}>
        <TemplateDetail
          history={this.props.history}
          readonly={this.readonly}
          templateName={this.template}
          onCancel={this.onCancel}
          onSubmitSuccess={() => this.props.history.push(ROUTES.COMPOSABLE_TEMPLATES)}
        />
      </div>
    );
  }
}

export default function (props: CreateComposableTemplateProps) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  return <CreateComposableTemplate {...props} {...dataSourceMenuProps} />;
}

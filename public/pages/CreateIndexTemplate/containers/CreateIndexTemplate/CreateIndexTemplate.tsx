/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import { isEqual } from "lodash";
import TemplateDetail from "../TemplateDetail";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { DataSourceMenuContext } from "../../../../services/DataSourceMenuContext";
import queryString from "query-string";

interface CreateIndexTemplateProps extends RouteComponentProps<{ template?: string; mode?: string }> {
  dataSourceId: string;
  dataSourceLabel: string;
  multiDataSourceEnabled: boolean;
}

class CreateIndexTemplate extends Component<CreateIndexTemplateProps> {
  static contextType = CoreServicesContext;

  get template() {
    return this.props.match.params.template;
  }

  get readonly() {
    return this.props.match.params.mode === "readonly";
  }

  setBreadCrumb() {
    const readonly = this.readonly;
    let lastBread: typeof BREADCRUMBS.TEMPLATES;
    if (readonly && this.template) {
      lastBread = {
        text: this.template,
        href: `#${this.props.location.pathname}`,
      };
    } else if (this.template) {
      lastBread = {
        text: this.template,
        href: `#${this.props.location.pathname}`,
      };
    } else {
      lastBread = BREADCRUMBS.CREATE_TEMPLATE;
    }
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TEMPLATES, lastBread]);
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

  componentDidUpdate(prevProps: Readonly<CreateIndexTemplateProps>): void {
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
    this.props.history.push(ROUTES.TEMPLATES);
  };

  render() {
    return (
      <div style={{ padding: "0px 50px" }}>
        <TemplateDetail
          history={this.props.history}
          location={this.props.location}
          templateName={this.template}
          onCancel={this.onCancel}
          onSubmitSuccess={() => this.props.history.push(ROUTES.TEMPLATES)}
        />
      </div>
    );
  }
}

export default function (props: CreateIndexTemplateProps) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  return <CreateIndexTemplate {...props} {...dataSourceMenuProps} />;
}

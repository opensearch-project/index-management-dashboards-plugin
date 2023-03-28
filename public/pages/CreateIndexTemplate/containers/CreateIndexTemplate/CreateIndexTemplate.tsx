/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { isEqual } from "lodash";
import TemplateDetail from "../TemplateDetail";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";

interface CreateIndexTemplateProps extends RouteComponentProps<{ template?: string; mode?: string }> {}

export default class CreateIndexTemplate extends Component<CreateIndexTemplateProps> {
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

  componentDidUpdate(prevProps: Readonly<CreateIndexTemplateProps>): void {
    if (!isEqual(prevProps, this.props)) {
      this.setBreadCrumb();
    }
  }

  componentDidMount = async (): Promise<void> => {
    this.setBreadCrumb();
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

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import TemplateDetail from "../TemplateDetail";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { isEqual } from "lodash";

interface CreateComposableTemplateProps extends RouteComponentProps<{ template?: string; mode?: string }> {}

export default class CreateComposableTemplate extends Component<CreateComposableTemplateProps> {
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

  componentDidUpdate(prevProps: Readonly<CreateComposableTemplateProps>): void {
    if (!isEqual(prevProps, this.props)) {
      this.setBreadCrumb();
    }
  }

  componentDidMount = async (): Promise<void> => {
    this.setBreadCrumb();
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

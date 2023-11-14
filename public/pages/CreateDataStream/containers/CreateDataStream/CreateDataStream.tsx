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
import { RouteComponentProps } from "react-router-dom";
import { isEqual } from "lodash";
import DataStreamDetail from "../DataStreamDetail";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";

type CreateDataStreamProps = RouteComponentProps<{ dataStream?: string }>;

export default class CreateDataStream extends Component<CreateDataStreamProps> {
  static contextType = CoreServicesContext;

  public get dataStream() {
    return this.props.match.params.dataStream;
  }

  setBreadCrumb() {
    const isEdit = this.dataStream;
    let lastBread: typeof BREADCRUMBS.TEMPLATES;
    if (isEdit) {
      lastBread = {
        text: this.dataStream || "",
        href: `#${this.props.location.pathname}`,
      };
    } else {
      lastBread = BREADCRUMBS.CREATE_DATA_STREAM;
    }
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.DATA_STREAMS, lastBread]);
  }

  componentDidUpdate(prevProps: Readonly<CreateDataStreamProps>): void {
    if (!isEqual(prevProps, this.props)) {
      this.setBreadCrumb();
    }
  }

  componentDidMount = async (): Promise<void> => {
    this.setBreadCrumb();
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.DATA_STREAMS);
  };

  render() {
    return (
      <div style={{ padding: "0px 50px" }}>
        <DataStreamDetail
          history={this.props.history}
          dataStream={this.dataStream}
          onCancel={this.onCancel}
          onSubmitSuccess={() => this.props.history.push(ROUTES.DATA_STREAMS)}
        />
      </div>
    );
  }
}

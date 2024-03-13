/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import DataStreamDetail from "../DataStreamDetail";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { isEqual } from "lodash";
import queryString from "query-string";
import { DataSourceMenuContext } from "../../../../services/DataSourceMenuContext";

interface CreateDataStreamProps extends RouteComponentProps<{ dataStream?: string }> {
  dataSourceId: string;
  dataSourceLabel: string;
  multiDataSourceEnabled: boolean;
}

class CreateDataStream extends Component<CreateDataStreamProps> {
  static contextType = CoreServicesContext;

  get dataStream() {
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

  componentDidUpdate(prevProps: Readonly<CreateDataStreamProps>): void {
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

export default function (props: CreateDataStreamProps) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  return <CreateDataStream {...props} {...dataSourceMenuProps} />;
}

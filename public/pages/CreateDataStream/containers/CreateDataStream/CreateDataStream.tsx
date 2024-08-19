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
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";
import { getUISettings } from "../../../../services/Services";

interface CreateDataStreamProps extends RouteComponentProps<{ dataStream?: string }>, DataSourceMenuProperties {}

type CreateDataStreamState = {
  useNewUX: boolean;
};

class CreateDataStream extends Component<CreateDataStreamProps, CreateDataStreamState> {
  static contextType = CoreServicesContext;

  constructor(props: CreateDataStreamProps) {
    super(props);
    const uiSettings = getUISettings();
    const useNewUX = uiSettings.get("home:useNewHomePage");
    this.state = {
      useNewUX: useNewUX,
    };
  }

  get dataStream() {
    return this.props.match.params.dataStream;
  }

  setBreadCrumb(useNewUX: boolean) {
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
    let breadCrumbs = useNewUX
      ? [BREADCRUMBS.DATA_STREAMS, lastBread]
      : [BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.DATA_STREAMS, lastBread];
    this.context.chrome.setBreadcrumbs(breadCrumbs);
  }
  componentDidUpdate(prevProps: Readonly<CreateDataStreamProps>): void {
    if (!isEqual(prevProps, this.props)) {
      this.setBreadCrumb(this.state.useNewUX);
    }
  }

  componentDidMount = async (): Promise<void> => {
    this.setBreadCrumb(this.state.useNewUX);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.DATA_STREAMS);
  };

  render() {
    const padding_style = this.state.useNewUX ? { padding: "0px 0px" } : { padding: "0px 50px" };
    return (
      <div style={padding_style}>
        <DataStreamDetail
          history={this.props.history}
          dataStream={this.dataStream}
          onCancel={this.onCancel}
          onSubmitSuccess={() => this.props.history.push(ROUTES.DATA_STREAMS)}
          key={this.props.dataSourceId}
          useNewUX={this.state.useNewUX}
        />
      </div>
    );
  }
}

export default function (props: Omit<CreateDataStreamProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  useUpdateUrlWithDataSourceProperties();
  return <CreateDataStream {...props} {...dataSourceMenuProps} />;
}

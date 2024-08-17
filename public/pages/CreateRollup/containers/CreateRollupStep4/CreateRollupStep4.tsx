/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiComboBoxOptionOption, EuiCallOut } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { DimensionItem, IndexItem, MetricItem } from "../../../../../models/interfaces";
import CreateRollupSteps from "../../components/CreateRollupSteps";
import HistogramAndMetrics from "../../components/HistogramAndMetrics";
import JobNameAndIndices from "../../components/JobNameAndIndices";
import ScheduleRolesAndNotifications from "../../components/ScheduleRolesAndNotifications";
import { CoreServicesContext } from "../../../../components/core_services";

interface CreateRollupProps extends RouteComponentProps {
  rollupService: RollupService;
  submitError: string;
  currentStep: number;
  onChangeStep: (step: number) => void;
  rollupId: string;
  description: string;
  sourceIndex: { label: string; value?: IndexItem }[];
  targetIndex: { label: string; value?: IndexItem }[];

  timestamp: EuiComboBoxOptionOption<String>[];
  intervalType: string;
  intervalValue: number;
  timezone: string;
  timeunit: string;
  selectedDimensionField: DimensionItem[];
  selectedMetrics: MetricItem[];

  jobEnabledByDefault: boolean;
  continuousJob: string;
  continuousDefinition: string;
  interval: number;
  intervalTimeunit: string;
  cronExpression: string;
  cronTimezone: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
  useNewUX: boolean;
}

export default class CreateRollupStep4 extends Component<CreateRollupProps> {
  static contextType = CoreServicesContext;
  constructor(props: CreateRollupProps) {
    super(props);
  }

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
  };

  render() {
    if (this.props.currentStep != 4) return null;

    const getTitle = !this.props.useNewUX
      ? () => {
          return (
            <>
              <EuiTitle size="l">
                <h1>Review and create</h1>
              </EuiTitle>
              <EuiSpacer />
            </>
          );
        }
      : () => {};
    const padding_style = this.props.useNewUX ? { padding: "0px 0px" } : { padding: "5px 50px" };

    return (
      <div style={padding_style}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateRollupSteps step={4} />
          </EuiFlexItem>
          <EuiFlexItem>
            {getTitle()}
            <JobNameAndIndices {...this.props} />
            <EuiSpacer />
            <HistogramAndMetrics {...this.props} />
            <EuiSpacer />
            <ScheduleRolesAndNotifications {...this.props} />
            <EuiSpacer />
            <EuiCallOut color="warning">
              <p>You can't change aggregations or metrics after creating a job. Double-check your choices before proceeding.</p>
            </EuiCallOut>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}

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
  sourceIndex: Array<{ label: string; value?: IndexItem }>;
  targetIndex: Array<{ label: string; value?: IndexItem }>;

  timestamp: Array<EuiComboBoxOptionOption<string>>;
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
    if (this.props.currentStep !== 4) return null;

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateRollupSteps step={4} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Review and create</h1>
            </EuiTitle>
            <EuiSpacer />
            <JobNameAndIndices {...this.props} />
            <EuiSpacer />
            <HistogramAndMetrics {...this.props} />
            <EuiSpacer />
            <ScheduleRolesAndNotifications {...this.props} />
            <EuiSpacer />
            <EuiCallOut color="warning">
              <p>You can&apos;t change aggregations or metrics after creating a job. Double-check your choices before proceeding.</p>
            </EuiCallOut>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}

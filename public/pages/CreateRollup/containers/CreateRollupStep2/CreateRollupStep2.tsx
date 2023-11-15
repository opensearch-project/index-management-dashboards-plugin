/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiCallOut, EuiComboBoxOptionOption } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import CreateRollupSteps from "../../components/CreateRollupSteps";
import TimeAggregation from "../../components/TimeAggregations";
import AdvancedAggregation from "../../components/AdvancedAggregation";
import MetricsCalculation from "../../components/MetricsCalculation";
import { DimensionItem, FieldItem, MetricItem } from "../../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";

interface CreateRollupStep2Props extends RouteComponentProps {
  rollupService: RollupService;
  currentStep: number;
  fields: FieldItem[];
  selectedTerms: FieldItem[];
  selectedDimensionField: DimensionItem[];
  selectedMetrics: MetricItem[];
  metricError: string;
  timestamp: Array<EuiComboBoxOptionOption<string>>;
  timestampError: string;
  intervalValue: number;
  intervalType: string;
  timezone: string;
  timeunit: string;
  onChangeTimestamp: (selectedOptions: Array<EuiComboBoxOptionOption<string>>) => void;
  onChangeIntervalType: (optionId: string) => void;
  onChangeIntervalValue: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeTimezone: (e: ChangeEvent<HTMLSelectElement>) => void;
  onDimensionSelectionChange: (selectedFields: DimensionItem[]) => void;
  onMetricSelectionChange: (selectedFields: MetricItem[]) => void;
}

export default class CreateRollupStep2 extends Component<CreateRollupStep2Props> {
  static contextType = CoreServicesContext;
  constructor(props: CreateRollupStep2Props) {
    super(props);
  }

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS]);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.ROLLUPS);
  };

  render() {
    if (this.props.currentStep !== 2) return null;
    const { fields, timestamp } = this.props;

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateRollupSteps step={2} />
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Define aggregations and metrics</h1>
            </EuiTitle>
            <EuiSpacer />

            <TimeAggregation {...this.props} selectedTimestamp={timestamp} fieldsOption={fields} />
            <EuiSpacer />
            <AdvancedAggregation {...this.props} fieldsOption={fields} />
            <EuiSpacer />
            <MetricsCalculation {...this.props} fieldsOption={fields} />
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

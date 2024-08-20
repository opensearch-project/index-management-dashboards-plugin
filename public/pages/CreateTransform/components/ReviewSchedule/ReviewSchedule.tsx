/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiFlexGrid, EuiFlexItem, EuiText } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { buildIntervalScheduleText } from "../../../CreateRollup/utils/helpers";

interface ReviewScheduleProps {
  jobEnabledByDefault: boolean;
  continuousJob: string;
  interval: number;
  intervalTimeunit: string;
  pageSize: number;
  onChangeStep: (step: number) => void;
}

export default class ReviewSchedule extends Component<ReviewScheduleProps> {
  constructor(props: ReviewScheduleProps) {
    super(props);
  }

  render() {
    const { jobEnabledByDefault, continuousJob, interval, intervalTimeunit, pageSize, onChangeStep } = this.props;

    const enabled = jobEnabledByDefault ? "Yes" : "No";

    const schedule = buildIntervalScheduleText(continuousJob === "yes", interval, intervalTimeunit);

    return (
      <ContentPanel
        actions={
          <ModalConsumer>
            {() => (
              <ContentPanelActions
                actions={[
                  {
                    text: "Edit",
                    buttonProps: {
                      onClick: () => onChangeStep(3),
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        panelStyles={{ padding: "20px 20px" }}
        bodyStyles={{ padding: "10px" }}
        title="Specify schedule"
        titleSize="m"
      >
        <div>
          <EuiFlexGrid columns={4}>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Enabled by default</dt>
                <dd>{enabled}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Schedule</dt>
                <dd>{schedule}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Pages per execution</dt>
                <dd>{pageSize}</dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
        </div>
      </ContentPanel>
    );
  }
}

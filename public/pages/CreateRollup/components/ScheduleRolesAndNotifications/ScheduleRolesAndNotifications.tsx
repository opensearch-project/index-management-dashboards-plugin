/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiFlexGrid, EuiFlexItem, EuiSpacer, EuiText } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { parseTimeunit, buildIntervalScheduleText, buildCronScheduleText } from "../../utils/helpers";

interface ScheduleRolesAndNotificationsProps {
  rollupId: string;
  onChangeStep: (step: number) => void;
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

export default class ScheduleRolesAndNotifications extends Component<ScheduleRolesAndNotificationsProps> {
  render() {
    const {
      onChangeStep,
      jobEnabledByDefault,
      continuousJob,
      continuousDefinition,
      interval,
      intervalTimeunit,
      cronExpression,
      pageSize,
      delayTime,
      delayTimeunit,
    } = this.props;

    let scheduleText =
      continuousDefinition === "fixed"
        ? buildIntervalScheduleText(continuousJob === "yes", interval, intervalTimeunit)
        : buildCronScheduleText(continuousJob === "yes", cronExpression);

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
        bodyStyles={{ padding: "initial" }}
        title="Schedule"
        titleSize="s"
      >
        <div style={{ padding: "15px" }}>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={4}>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Enabled by default</dt>
                <dd>{jobEnabledByDefault ? "Yes" : "No"}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Schedule</dt>
                <dd>{scheduleText}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Pages per execution</dt>
                <dd>{pageSize}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Execution delay</dt>
                <dd>
                  {isNaN(delayTime) || delayTime == undefined || delayTime == 0 ? "-" : delayTime + " " + parseTimeunit(delayTimeunit)}
                </dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="s" />
        </div>
      </ContentPanel>
    );
  }
}

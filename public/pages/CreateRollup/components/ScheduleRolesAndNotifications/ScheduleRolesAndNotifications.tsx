/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiFlexGrid, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPanel, EuiSpacer, EuiText, EuiTitle } from "@elastic/eui";
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
      <EuiPanel>
        <EuiFlexGroup gutterSize="xs">
          <EuiFlexItem>
            <EuiTitle size="s">
              <h2>Schedule</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
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
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiHorizontalRule margin={"xs"} />
        <div>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={4}>
            <EuiFlexItem>
              <EuiText size="s">
                <dt>Enabled by default</dt>
                <dd>{jobEnabledByDefault ? "Yes" : "No"}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="s">
                <dt>Schedule</dt>
                <dd>{scheduleText}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="s">
                <dt>Pages per execution</dt>
                <dd>{pageSize}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="s">
                <dt>Execution delay</dt>
                <dd>
                  {isNaN(delayTime) || delayTime == undefined || delayTime == 0 ? "-" : delayTime + " " + parseTimeunit(delayTimeunit)}
                </dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="s" />
        </div>
      </EuiPanel>
    );
  }
}

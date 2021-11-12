/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiLink, EuiIcon, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import "brace/theme/github";
import "brace/mode/json";
import { CoreServicesContext } from "../../../../components/core_services";
import LegacyNotification from "../../components/LegacyNotification";
import { ERROR_NOTIFICATION_DOCUMENTATION_URL } from "../../../../utils/constants";

interface ErrorNotificationProps {
  errorNotificationJsonString: string;
  onChangeErrorNotificationJsonString: (str: string) => void;
}

interface ErrorNotificationState {}

export default class ErrorNotification extends Component<ErrorNotificationProps, ErrorNotificationState> {
  static contextType = CoreServicesContext;
  constructor(props: ErrorNotificationProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { errorNotificationJsonString, onChangeErrorNotificationJsonString } = this.props;
    const content = (
      <LegacyNotification
        notificationJsonString={errorNotificationJsonString}
        onChangeNotificationJsonString={onChangeErrorNotificationJsonString}
      />
    );

    return (
      <ContentPanel
        bodyStyles={{ padding: "initial" }}
        title={
          <EuiFlexGroup gutterSize="xs" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiText>
                <h3>Error notification</h3>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText color="subdued">
                <i> - optional</i>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        titleSize="s"
        subTitleText={
          <EuiText color="subdued" size="s" style={{ padding: "5px 0px" }}>
            <p style={{ fontWeight: 200 }}>
              You can set up an error notification for when a policy execution fails.{" "}
              <EuiLink href={ERROR_NOTIFICATION_DOCUMENTATION_URL} target="_blank">
                Learn more <EuiIcon type="popout" size="s" />
              </EuiLink>
            </p>
          </EuiText>
        }
      >
        <div style={{ padding: "10px 0px 0px 10px" }}>{content}</div>
      </ContentPanel>
    );
  }
}

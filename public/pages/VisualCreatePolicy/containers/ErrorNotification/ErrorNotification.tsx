/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React, { ChangeEvent, Component } from "react";
import { EuiLink, EuiIcon, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import "brace/theme/github";
import "brace/mode/json";
import { FeatureChannelList } from "../../../../../server/models/interfaces";
import { NotificationService } from "../../../../services";
import { ErrorNotification as IErrorNotification } from "../../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { CoreServicesContext } from "../../../../components/core_services";
import ChannelNotification from "../../components/ChannelNotification";
import LegacyNotification from "../../components/LegacyNotification";
import { DOCUMENTATION_URL } from "../../../../utils/constants";

interface ErrorNotificationProps {
  errorNotification: IErrorNotification | undefined;
  errorNotificationJsonString: string;
  onChangeChannelId: (value: ChangeEvent<HTMLSelectElement>) => void;
  onChangeMessage: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeErrorNotificationJsonString: (str: string) => void;
  onSwitchToChannels: () => void;
  notificationService: NotificationService;
}

interface ErrorNotificationState {
  channels: FeatureChannelList[];
  loadingChannels: boolean;
}

export default class ErrorNotification extends Component<ErrorNotificationProps, ErrorNotificationState> {
  static contextType = CoreServicesContext;
  constructor(props: ErrorNotificationProps) {
    super(props);

    this.state = {
      channels: [],
      loadingChannels: true,
    };
  }

  componentDidMount = async (): Promise<void> => {
    await this.getChannels();
  };

  getChannels = async (): Promise<void> => {
    this.setState({ loadingChannels: true });
    try {
      const { notificationService } = this.props;
      const response = await notificationService.getChannels();
      if (response.ok) {
        this.setState({ channels: response.response.feature_channel_list });
      } else {
        this.context.notifications.toasts.addDanger(`Could not load notification channels: ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not load the notification channels"));
    }
    this.setState({ loadingChannels: false });
  };

  render() {
    const {
      errorNotification,
      errorNotificationJsonString,
      onChangeChannelId,
      onChangeMessage,
      onChangeErrorNotificationJsonString,
      onSwitchToChannels,
    } = this.props;
    const { channels, loadingChannels } = this.state;
    const hasDestination = !!errorNotification?.destination;

    let content = (
      <ChannelNotification
        channelId={errorNotification?.channel?.id || ""}
        channels={channels}
        loadingChannels={loadingChannels}
        message={errorNotification?.message_template?.source || ""}
        onChangeChannelId={onChangeChannelId}
        onChangeMessage={onChangeMessage}
        getChannels={this.getChannels}
      />
    );

    // If we have a destination in the error notification then it's either an older policy or they created through the API
    if (hasDestination) {
      content = (
        <LegacyNotification
          notificationJsonString={errorNotificationJsonString}
          onChangeNotificationJsonString={onChangeErrorNotificationJsonString}
          onSwitchToChannels={onSwitchToChannels}
        />
      );
    }

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
          <EuiText size="s" style={{ padding: "5px 0px" }}>
            <p style={{ color: "grey", fontWeight: 200 }}>
              You can set up an error notification for when a policy execution fails to notify you.{" "}
              <EuiLink href={DOCUMENTATION_URL} target="_blank">
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

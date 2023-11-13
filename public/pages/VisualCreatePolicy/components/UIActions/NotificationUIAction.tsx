/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { UIAction, NotificationAction } from "../../../../../models/interfaces";
import { NotificationService, ServicesConsumer } from "../../../../services";
import { FeatureChannelList } from "../../../../../server/models/interfaces";
import LegacyNotification from "../LegacyNotification";
import ChannelNotification from "../ChannelNotification";
import { getErrorMessage, makeId } from "../../../../utils/helpers";
import { BrowserServices } from "../../../../models/interfaces";
import { ActionType, DEFAULT_NOTIFICATION } from "../../utils/constants";

interface NotifUIState {
  channels: FeatureChannelList[];
  loadingChannels: boolean;
}
interface NotifUIProps {
  action: NotificationAction;
  clone: (action: NotificationAction) => NotificationUIAction;
  onChangeAction: (action: UIAction<NotificationAction>) => void;
  isInvalid: boolean;
  notificationService: NotificationService;
}
class NotifUI extends React.Component<NotifUIProps, NotifUIState> {
  state: NotifUIState = {
    channels: [],
    loadingChannels: true,
  };

  componentDidMount(): void {
    this.getChannels();
  }

  getChannels = async (): Promise<void> => {
    this.setState({ loadingChannels: true });
    try {
      const { notificationService } = this.props;
      const response = await notificationService.getChannels();
      if (response.ok) {
        this.setState({
          channels: response.response.channel_list,
        });
      } else {
        this.context.notifications.toasts.addDanger(`Could not load notification channels: ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not load the notification channels"));
    }
    this.setState({ loadingChannels: false });
  };

  onChangeChannelId = (e: ChangeEvent<HTMLSelectElement>) => {
    const { action, clone, onChangeAction } = this.props;
    const id = e.target.value;
    onChangeAction(
      clone({
        ...action,
        notification: {
          ...action.notification,
          channel: {
            id,
          },
        },
      })
    );
  };

  onChangeMessage = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { action, clone, onChangeAction } = this.props;
    const message = e.target.value;
    onChangeAction(
      clone({
        ...action,
        notification: {
          ...action.notification,
          message_template: {
            source: message,
          },
        },
      })
    );
  };

  onChangeNotificationJsonString = (str: string) => {
    const { action, clone, onChangeAction } = this.props;
    onChangeAction(
      clone({
        ...action,
        notificationJsonString: str,
      })
    );
  };

  onSwitchToChannels = () => {
    const { action, clone, onChangeAction } = this.props;
    // Keep any retry settings and overwrite the notification w/ default channels notification
    const newAction: NotificationAction = { ...action, ...DEFAULT_NOTIFICATION };
    // Delete the notification json string
    delete newAction.notificationJsonString;
    onChangeAction(clone(newAction));
  };

  render() {
    const { action, isInvalid } = this.props;
    const { channels, loadingChannels } = this.state;

    const hasDestination = !!action.notification?.destination;

    if (hasDestination) {
      return (
        <LegacyNotification
          notificationJsonString={action.notificationJsonString || ""}
          onChangeNotificationJsonString={this.onChangeNotificationJsonString}
          onSwitchToChannels={this.onSwitchToChannels}
          actionNotification
        />
      );
    }

    return (
      <ChannelNotification
        channelId={action.notification?.channel?.id || ""}
        channels={channels}
        loadingChannels={loadingChannels}
        message={action.notification.message_template.source}
        onChangeChannelId={this.onChangeChannelId}
        onChangeMessage={this.onChangeMessage}
        getChannels={this.getChannels}
        actionNotification
        isInvalid={isInvalid}
      />
    );
  }
}

export default class NotificationUIAction implements UIAction<NotificationAction> {
  id: string;
  action: NotificationAction;
  type = ActionType.Notification;

  /**
   * For render purposes we use notificationJsonString if it's a legacy notification
   * For all other cases we render using action's notification field
   * When action is stored to state we only store action's notification field and discard notificationJSonString
   *
   * In the constructor we need to support editing and viewing of both legacy and new notifications:
   */
  constructor(action: NotificationAction, id: string = makeId()) {
    // notificationJsonString is only populated for legacy notifications
    let notificationJsonString = "";

    // legacy notification - populate notificationJsonString using action.notification to render this information
    if (!!action.notification.destination) {
      notificationJsonString = JSON.stringify(action.notification, null, 4);
    }

    // If action.notificationJsonString is not empty it means the legacy notification is being edited and
    // action.notification will be stale, we override the notificationJsonString with action.notificationJsonString
    if (action.notificationJsonString) {
      notificationJsonString = action.notificationJsonString;
    }

    this.action = { ...action, notificationJsonString };
    this.id = id;
  }

  content = () => `Notification`;

  clone = (action: NotificationAction) => new NotificationUIAction(action, this.id);

  isValid = () => {
    try {
      // validate only if it's not empty
      if (this.action.notificationJsonString) {
        JSON.parse(this.action.notificationJsonString);
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  render = (action: UIAction<NotificationAction>, onChangeAction: (action: UIAction<NotificationAction>) => void) => {
    return (
      <ServicesConsumer>
        {(services: BrowserServices | null) =>
          services && (
            <NotifUI
              onChangeAction={onChangeAction}
              action={this.action}
              clone={this.clone}
              isInvalid={!this.isValid()}
              notificationService={services.notificationService}
            />
          )
        }
      </ServicesConsumer>
    );
  };

  toAction = () => {
    // If they used legacy json editor use the json string
    const newAction = { ...this.action };
    let notification = newAction.notification;
    // if notificationJsonString is present it means a legacy notification and we need to generate action.notification using this value
    if (!!newAction.notificationJsonString) {
      notification = JSON.parse(newAction.notificationJsonString);
    }
    // otherwise delete it and return the action
    delete newAction.notificationJsonString;
    return { ...newAction, notification };
  };
}

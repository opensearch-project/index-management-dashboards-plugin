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
          channels: response.response.feature_channel_list,
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

  constructor(action: NotificationAction, id: string = makeId(), useNotificationString: boolean = false) {
    let notificationJsonString = JSON.stringify(action.notification, null, 4);
    if (useNotificationString) {
      notificationJsonString = action.notificationJsonString;
    }
    this.action = { ...action, notificationJsonString };
    this.id = id;
  }

  content = () => `Notification`;

  clone = (action: NotificationAction) => new NotificationUIAction(action, this.id);

  cloneUsingString = (action: NotificationAction) => new NotificationUIAction(action, this.id, true);

  isValid = () => {
    try {
      JSON.parse(this.action.notificationJsonString);
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
              clone={this.cloneUsingString}
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
    if (!!newAction.notificationJsonString) {
      notification = JSON.parse(newAction.notificationJsonString);
    }
    // otherwise delete it and return the action
    delete newAction.notificationJsonString;
    return { ...newAction, notification };
  };
}

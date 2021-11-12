/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { UIAction, NotificationAction } from "../../../../../models/interfaces";
import { ServicesConsumer } from "../../../../services";
import LegacyNotification from "../LegacyNotification";
import { makeId } from "../../../../utils/helpers";
import { BrowserServices } from "../../../../models/interfaces";
import { ActionType } from "../../utils/constants";

interface NotifUIState {}
interface NotifUIProps {
  action: NotificationAction;
  clone: (action: NotificationAction) => NotificationUIAction;
  onChangeAction: (action: UIAction<NotificationAction>) => void;
  isInvalid: boolean;
}
class NotifUI extends React.Component<NotifUIProps, NotifUIState> {
  onChangeNotificationJsonString = (str: string) => {
    const { action, clone, onChangeAction } = this.props;
    onChangeAction(
      clone({
        ...action,
        notificationJsonString: str,
      })
    );
  };

  render() {
    const { action, isInvalid } = this.props;
    return (
      <LegacyNotification
        notificationJsonString={action.notificationJsonString || ""}
        onChangeNotificationJsonString={this.onChangeNotificationJsonString}
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
            <NotifUI onChangeAction={onChangeAction} action={this.action} clone={this.cloneUsingString} isInvalid={!this.isValid()} />
          )
        }
      </ServicesConsumer>
    );
  };

  toAction = () => {
    const newAction = { ...this.action };
    const notification = JSON.parse(newAction.notificationJsonString);
    // delete json strng key and return the action
    delete newAction.notificationJsonString;
    return { ...newAction, notification };
  };
}

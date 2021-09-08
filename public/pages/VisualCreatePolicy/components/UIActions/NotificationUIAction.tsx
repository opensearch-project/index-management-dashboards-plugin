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
    const { action } = this.props;
    return (
      <LegacyNotification
        notificationJsonString={action.notificationJsonString || ""}
        onChangeNotificationJsonString={this.onChangeNotificationJsonString}
        actionNotification
      />
    );
  }
}

export default class NotificationUIAction implements UIAction<NotificationAction> {
  id: string;
  action: NotificationAction;
  type = ActionType.Notification;

  constructor(action: NotificationAction, id: string = makeId()) {
    const notificationJsonString = JSON.stringify(action.notification, null, 4);
    this.action = { ...action, notificationJsonString };
    this.id = id;
  }

  content = () => `Notification`;

  clone = (action: NotificationAction) => new NotificationUIAction(action, this.id);

  isValid = (action: UIAction<NotificationAction>) => {
    try {
      JSON.parse(action.action.notificationJsonString);
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
          services && <NotifUI onChangeAction={onChangeAction} action={this.action} clone={this.clone} />
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

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

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import NotificationCallout, { INotificationCalloutProps } from "./NotificationCallout";
import { browserServicesMock } from "../../../test/mocks";
import { ActionType, OperationType } from "../../pages/Notifications/constant";
import { IAPICaller } from "../../../models/interfaces";

function renderNotification(props: Omit<INotificationCalloutProps, "actionType" | "operationType">) {
  return {
    ...render(<NotificationCallout actionType={ActionType.RESIZE} operationType={OperationType.SHRINK} {...props} />),
  };
}
/**
 * xyz
 * x has view permission
 * y has create permission
 * z has default notification
 * all the combos:
 * 000, 010, 100, 101, 110, 111
 */
describe("<ChannelNotification /> spec", () => {
  /**
   * 000
   */
  it("renders with no permission and no default notification", async () => {
    const { container, findByText } = renderNotification({
      permissionForViewLRON: false,
      permissionForCreateLRON: false,
      hasDefaultNotification: false,
    });
    await findByText(/Your administrator may have set default notification settings for/);
    expect(container).toMatchSnapshot();
  });

  /**
   * 010
   */
  it("renders with create permission and no default notification", async () => {
    const { container, findByText } = renderNotification({
      permissionForViewLRON: false,
      permissionForCreateLRON: true,
      hasDefaultNotification: false,
    });
    await findByText(/Your administrator may have set default notification settings for/);
    await findByText(/You can send additional notifications for this operation/);
    expect(container).toMatchSnapshot();
  });

  /**
   * 100
   */
  it("renders with view permission and no default notification", async () => {
    const { container } = renderNotification({
      permissionForViewLRON: true,
      permissionForCreateLRON: false,
      hasDefaultNotification: false,
    });
    expect(container).toMatchSnapshot();
  });

  /**
   * 101
   */
  it("renders with view permission and default notification", async () => {
    const { container, findByText } = renderNotification({
      permissionForViewLRON: true,
      permissionForCreateLRON: false,
      hasDefaultNotification: true,
    });
    await findByText(/Your administrator has set default notification settings for/);
    expect(container).toMatchSnapshot();
  });

  /**
   * 110
   */
  it("renders with full permission and no default notification", async () => {
    const { queryByTestId } = renderNotification({
      permissionForViewLRON: true,
      permissionForCreateLRON: true,
      hasDefaultNotification: false,
    });
    await waitFor(() => expect(queryByTestId("defaultNotificationCallout")).toBeNull());
  });

  /**
   * 111
   */
  it("renders with full permission and default notification", async () => {
    const { container, findByText } = renderNotification({
      permissionForViewLRON: true,
      permissionForCreateLRON: true,
      hasDefaultNotification: true,
    });
    await findByText(/Configure default settings at/);
    expect(container).toMatchSnapshot();
  });
});

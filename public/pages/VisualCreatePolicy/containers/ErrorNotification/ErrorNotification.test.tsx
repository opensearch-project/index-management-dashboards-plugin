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
import { render } from "@testing-library/react";
import ErrorNotification, { ErrorNotificationProps } from "./ErrorNotification";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { BrowserServices } from "../../../../models/interfaces";
import { ErrorNotification as IErrorNotification } from "../../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";

function ErrorNotificationWrapper(props: ErrorNotificationProps) {
  return (
    <CoreServicesContext.Provider value={coreServicesMock}>
      <ErrorNotification {...props} />
    </CoreServicesContext.Provider>
  );
}

function renderErrorNotification(errorNotification: IErrorNotification) {
  return {
    ...render(
      <ServicesContext.Provider value={browserServicesMock}>
        <ServicesConsumer>
          {(services: BrowserServices | null) =>
            services && (
              <ErrorNotificationWrapper
                errorNotification={errorNotification}
                errorNotificationJsonString={""}
                onChangeChannelId={() => {}}
                onChangeMessage={() => {}}
                onChangeErrorNotificationJsonString={() => {}}
                onSwitchToChannels={() => {}}
                notificationService={services?.notificationService}
              />
            )
          }
        </ServicesConsumer>
      </ServicesContext.Provider>
    ),
  };
}

describe("<ErrorNotification /> spec", () => {
  it("renders the component", () => {
    const { container } = render(
      <ErrorNotificationWrapper
        errorNotification={{ channel: { id: "some_id" }, message_template: { source: "some source message" } }}
        errorNotificationJsonString={""}
        onChangeChannelId={() => {}}
        onChangeMessage={() => {}}
        onChangeErrorNotificationJsonString={() => {}}
        onSwitchToChannels={() => {}}
        notificationService={browserServicesMock.notificationService}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders the channel ui editor for channels", () => {
    const errorNotification = { channel: { id: "some_id" }, message_template: { source: "some source message" } };
    const { queryByTestId } = renderErrorNotification(errorNotification);

    expect(queryByTestId("channel-notification-refresh")).not.toBeNull();
    expect(queryByTestId("create-policy-legacy-notification")).toBeNull();
  });

  it("renders the json legacy editor for destinations", () => {
    const errorNotification = { destination: { slack: { url: "https://slack.com" } }, message_template: { source: "some source message" } };
    const { queryByTestId } = renderErrorNotification(errorNotification);

    expect(queryByTestId("channel-notification-refresh")).toBeNull();
    expect(queryByTestId("create-policy-legacy-notification")).not.toBeNull();
  });
});

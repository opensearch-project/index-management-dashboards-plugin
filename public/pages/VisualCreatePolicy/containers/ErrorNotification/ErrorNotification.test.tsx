/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import ErrorNotification from "./ErrorNotification";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { browserServicesMock } from "../../../../../test/mocks";
import { BrowserServices } from "../../../../models/interfaces";
import { ErrorNotification as IErrorNotification } from "../../../../../models/interfaces";

function renderErrorNotification(errorNotification: IErrorNotification) {
  return {
    ...render(
      <ServicesContext.Provider value={browserServicesMock}>
        <ServicesConsumer>
          {(services: BrowserServices | null) =>
            services && (
              <ErrorNotification
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
      <ErrorNotification
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

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import ErrorNotificationContainer, { ErrorNotificationProps } from "./ErrorNotification";
import { ServicesContext } from "../../services";
import { browserServicesMock } from "../../../test/mocks";
import { ErrorNotification as IErrorNotification } from "../../../models/interfaces";

const ErrorNotification = (props: Pick<ErrorNotificationProps, "value">) => {
  const [value, onChange] = useState(props.value);
  return <ErrorNotificationContainer {...props} value={value} onChange={onChange} />;
};

function renderErrorNotification(errorNotification: IErrorNotification) {
  return {
    ...render(
      <ServicesContext.Provider value={browserServicesMock}>
        <ErrorNotification value={errorNotification} />
      </ServicesContext.Provider>
    ),
  };
}

describe("<ErrorNotification /> spec", () => {
  it("renders the component", () => {
    const { container } = render(
      <ErrorNotification value={{ channel: { id: "some_id" }, message_template: { source: "some source message" } }} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders the channel ui editor for channels", () => {
    const errorNotification = { channel: { id: "some_id" }, message_template: { source: "some source message" } };
    const { queryByTestId, queryByText } = renderErrorNotification(errorNotification);

    expect(queryByTestId("channel-notification-refresh")).not.toBeNull();
    expect(queryByText("Switch to using Channel ID")).toBeNull();
  });

  it("renders the json legacy editor for destinations", () => {
    const errorNotification = { destination: { slack: { url: "https://slack.com" } }, message_template: { source: "some source message" } };
    const { queryByTestId, queryByText } = renderErrorNotification(errorNotification);

    expect(queryByTestId("channel-notification-refresh")).toBeNull();
    expect(queryByText("Switch to using Channel ID")).not.toBeNull();
  });
});

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

import React, { useState } from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import ErrorNotificationContainer, { ErrorNotificationProps } from "./ErrorNotification";
import { ServicesContext } from "../../services";
import { browserServicesMock, coreServicesMock } from "../../../test/mocks";
import { ErrorNotification as IErrorNotification } from "../../../models/interfaces";
import { CoreServicesContext } from "../../components/core_services";

const ErrorNotification = (props: Pick<ErrorNotificationProps, "value">) => {
  const [value, onChange] = useState(props.value);
  return (
    <CoreServicesContext.Provider value={coreServicesMock}>
      <ErrorNotificationContainer {...props} value={value} onChange={onChange} />
    </CoreServicesContext.Provider>
  );
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

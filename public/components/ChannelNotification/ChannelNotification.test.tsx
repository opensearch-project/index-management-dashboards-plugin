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

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { fireEvent, queryByTestId } from "@testing-library/dom";
import ChannelNotification from "./ChannelNotification";

describe("<ChannelNotification /> spec", () => {
  it("renders the component", () => {
    const { container } = render(
      <ChannelNotification
        channelId="some_id"
        channels={[{ config_id: "some_id", name: "Some id", description: "Some description", config_type: "chime", is_enabled: true }]}
        loadingChannels={false}
        message={"This is some message"}
        onChangeMessage={() => {}}
        onChangeChannelId={() => {}}
        getChannels={() => {}}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("calls getChannels with clicking refresh", async () => {
    const getChannels = jest.fn();
    const { getByTestId } = render(
      <ChannelNotification
        channelId="some_id"
        channels={[{ config_id: "some_id", name: "Some id", description: "Some description", config_type: "chime", is_enabled: true }]}
        loadingChannels={false}
        message={"This is some message"}
        onChangeMessage={() => {}}
        onChangeChannelId={() => {}}
        getChannels={getChannels}
      />
    );

    fireEvent.click(getByTestId("channel-notification-refresh"));
    expect(getChannels).toHaveBeenCalledTimes(1);
  });

  it("hides message area when no channel selected and shows it when channel selected", async () => {
    const getChannels = jest.fn();
    const { container, getByTestId, rerender } = render(
      <ChannelNotification
        channelId=""
        channels={[{ config_id: "some_id", name: "Some id", description: "Some description", config_type: "chime", is_enabled: true }]}
        loadingChannels={false}
        message={"This is some message"}
        onChangeMessage={() => {}}
        onChangeChannelId={() => {}}
        getChannels={getChannels}
      />
    );

    // text area should not be shown if channel id is empty/not selected
    expect(queryByTestId(container, "create-policy-notification-message")).toBeNull();

    rerender(
      <ChannelNotification
        channelId="some_id"
        channels={[{ config_id: "some_id", name: "Some id", description: "Some description", config_type: "chime", is_enabled: true }]}
        loadingChannels={false}
        message={"This is some message"}
        onChangeMessage={() => {}}
        onChangeChannelId={() => {}}
        getChannels={getChannels}
      />
    );

    expect(getByTestId("create-policy-notification-message")).not.toBeNull();
  });
});

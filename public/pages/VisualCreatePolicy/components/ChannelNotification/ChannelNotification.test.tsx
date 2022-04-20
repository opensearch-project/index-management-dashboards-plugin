/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import ChannelNotification from "./ChannelNotification";
import { fireEvent, queryByTestId } from "@testing-library/dom";

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

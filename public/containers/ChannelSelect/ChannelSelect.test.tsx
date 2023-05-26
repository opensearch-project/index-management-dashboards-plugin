/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import ChannelSelect, { ChannelSelectProps } from "./ChannelSelect";
import { browserServicesMock, coreServicesMock } from "../../../test/mocks";
import { ServicesContext } from "../../services";
import { CoreServicesContext } from "../../components/core_services";
import userEvent from "@testing-library/user-event";

function renderWithServiceAndCore(props: ChannelSelectProps) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ChannelSelect {...props} data-test-subj="1" />
          <ChannelSelect {...props} data-test-subj="2" />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<ChannelNotification /> spec", () => {
  it("renders the component", async () => {
    browserServicesMock.notificationService.getChannels = jest.fn(
      async (): Promise<any> => {
        return {
          ok: true,
          response: {
            start_index: 0,
            total_hits: 1,
            total_hit_relation: "eq",
            channel_list: [
              {
                config_id: "1",
                name: "1",
                description: "2",
                config_type: "chime",
                is_enabled: true,
              },
            ],
          },
        };
      }
    );
    const onChangeMock = jest.fn();
    const { container, getByTestId } = renderWithServiceAndCore({
      onChange: onChangeMock,
    });
    await waitFor(() => {
      expect(container.querySelector(".euiLoadingSpinner")).toBeNull();
    });
    await waitFor(() => {
      expect(browserServicesMock.notificationService.getChannels).toBeCalledTimes(1);
    });
    expect(container).toMatchSnapshot();
    await userEvent.type(getByTestId("1")?.querySelector('[data-test-subj="comboBoxSearchInput"]') as Element, "1{enter}");
    await waitFor(() => {
      expect(onChangeMock).toBeCalledTimes(1);
      expect(onChangeMock).toBeCalledWith([
        {
          id: "1",
        },
      ]);
    });
  });
});

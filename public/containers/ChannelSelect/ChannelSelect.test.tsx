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
import userEvent from "@testing-library/user-event";
import ChannelSelect, { ChannelSelectProps } from "./ChannelSelect";
import { browserServicesMock, coreServicesMock } from "../../../test/mocks";
import { ServicesContext } from "../../services";
import { CoreServicesContext } from "../../components/core_services";

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

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

import { render, waitFor } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import { coreServicesMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";
import IndexSelect from "./IndexSelect";

describe("<IndexSelect /> spec", () => {
  it("renders the component", async () => {
    const component = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <IndexSelect
          getIndexOptions={(str) => Promise.resolve([{ label: "sourceIndex" }])}
          onSelectedOptions={(options) => {}}
          selectedOption={[{ label: "sourceIndex" }]}
          singleSelect={true}
        />
      </CoreServicesContext.Provider>
    );
    await waitFor(() => {});
    expect(component).toMatchSnapshot();
  });

  it("renders the component with error", async () => {
    const getIndexOptionsFn = jest.fn().mockRejectedValue("service not available");
    act(() => {
      render(
        <CoreServicesContext.Provider value={coreServicesMock}>
          <IndexSelect
            getIndexOptions={getIndexOptionsFn}
            onSelectedOptions={(options) => {}}
            selectedOption={[{ label: "sourceIndex" }]}
            singleSelect={true}
          />
        </CoreServicesContext.Provider>
      );
    });
    await waitFor(() => {});
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
  });

  it("search async", async () => {
    const getIndexOptionsFn = jest.fn().mockResolvedValue([{ label: "test-index" }]);
    act(() => {
      render(
        <CoreServicesContext.Provider value={coreServicesMock}>
          <IndexSelect
            getIndexOptions={getIndexOptionsFn}
            onSelectedOptions={(options) => {}}
            selectedOption={[{ label: "sourceIndex" }]}
            singleSelect={false}
          />
        </CoreServicesContext.Provider>
      );
    });
    await waitFor(() => {});
    expect(getIndexOptionsFn).toHaveBeenCalledTimes(1);
  });
});

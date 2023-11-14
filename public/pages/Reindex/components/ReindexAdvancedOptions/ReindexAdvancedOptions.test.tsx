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
import ReindexAdvancedOptions from "./ReindexAdvancedOptions";
import { coreServicesMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";

describe("<ReindexAdvancedOptions /> spec", () => {
  it("renders the component", async () => {
    const component = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ReindexAdvancedOptions
          slices="5"
          onSlicesChange={() => {}}
          selectedPipelines={[]}
          onSelectedPipelinesChange={() => {}}
          ignoreConflicts={true}
          onIgnoreConflictsChange={() => {}}
          getAllPipelines={async () => [{ label: "pipeline" }]}
          reindexUniqueDocuments={true}
          onReindexUniqueDocumentsChange={() => {}}
        />
      </CoreServicesContext.Provider>
    );
    // wait for one tick
    await waitFor(() => {});
    expect(component).toMatchSnapshot();
  });

  it("renders the component with slice error", async () => {
    const { findByText } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ReindexAdvancedOptions
          slices="0"
          onSlicesChange={() => {}}
          sliceErr={"slice must be positive integer or auto"}
          selectedPipelines={[]}
          onSelectedPipelinesChange={() => {}}
          ignoreConflicts={false}
          onIgnoreConflictsChange={() => {}}
          getAllPipelines={async () => [{ label: "pipeline" }]}
          reindexUniqueDocuments={true}
          onReindexUniqueDocumentsChange={() => {}}
        />
      </CoreServicesContext.Provider>
    );

    // wait for one tick
    await waitFor(() => {});
    expect(findByText("slice must be positive integer or auto")).not.toBeNull();
  });

  it("get pipeline error", async () => {
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ReindexAdvancedOptions
          slices="1"
          onSlicesChange={() => {}}
          selectedPipelines={[]}
          onSelectedPipelinesChange={() => {}}
          ignoreConflicts={false}
          onIgnoreConflictsChange={() => {}}
          getAllPipelines={async () => Promise.reject("service not available")}
          reindexUniqueDocuments={true}
          onReindexUniqueDocumentsChange={() => {}}
        />
      </CoreServicesContext.Provider>
    );

    // wait for one tick
    await waitFor(() => {});
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
  });

  it("get pipeline api been called", async () => {
    const getPipeline = jest.fn().mockResolvedValue([{ label: "test1" }]);
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ReindexAdvancedOptions
          slices="1"
          onSlicesChange={() => {}}
          selectedPipelines={[]}
          onSelectedPipelinesChange={() => {}}
          ignoreConflicts={false}
          onIgnoreConflictsChange={() => {}}
          getAllPipelines={getPipeline}
          reindexUniqueDocuments={true}
          onReindexUniqueDocumentsChange={() => {}}
        />
      </CoreServicesContext.Provider>
    );

    // wait for one tick
    await waitFor(() => {});
    expect(getPipeline).toBeCalledTimes(1);
  });
});

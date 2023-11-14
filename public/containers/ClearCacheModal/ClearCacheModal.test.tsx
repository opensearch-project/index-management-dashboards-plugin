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
import { CoreStart } from "opensearch-dashboards/public";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { browserServicesMock, coreServicesMock } from "../../../test/mocks";
import { CoreServicesContext } from "../../components/core_services";
import { ServicesContext } from "../../services";
import { BrowserServices } from "../../models/interfaces";
import { ModalProvider } from "../../components/Modal";
import ClearCacheModal, { ClearCacheModalProps } from "./ClearCacheModal";
import { INDEX_OP_TARGET_TYPE } from "../../utils/constants";

function renderWithRouter(
  coreServicesContext: CoreStart | null,
  browserServicesContext: BrowserServices | null,
  props: ClearCacheModalProps
) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesContext}>
        <ServicesContext.Provider value={browserServicesContext}>
          <ModalProvider>
            <ClearCacheModal {...props} />
          </ModalProvider>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}
describe("<ClearCacheModal /> spec", () => {
  it("renders the component", async () => {
    renderWithRouter(coreServicesMock, browserServicesMock, {
      selectedItems: [],
      visible: true,
      type: INDEX_OP_TARGET_TYPE.INDEX,
      onClose: () => {},
    });
    await act(async () => {});
    expect(document.body.children).toMatchSnapshot();
  });

  it("calls close when cancel button clicked", async () => {
    const onClose = jest.fn();
    const { getByTestId, getByText } = renderWithRouter(coreServicesMock, browserServicesMock, {
      selectedItems: [],
      visible: true,
      type: INDEX_OP_TARGET_TYPE.INDEX,
      onClose,
    });
    await waitFor(() => {
      expect(getByText("Cache will be cleared for all open indexes.")).toBeInTheDocument();
    });
    fireEvent.click(getByTestId("ClearCacheCancelButton"));
    expect(onClose).toHaveBeenCalled();
  });
});

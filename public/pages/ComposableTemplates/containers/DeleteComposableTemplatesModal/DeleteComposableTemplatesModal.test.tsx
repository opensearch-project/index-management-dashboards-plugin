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
import { render } from "@testing-library/react";
import DeleteTemplateModal, { DeleteTemplateModalProps } from "./DeleteComposableTemplatesModal";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";

function renderWithContext(props: DeleteTemplateModalProps) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <DeleteTemplateModal {...props} />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<DeleteTemplateModal /> spec", () => {
  it("renders the component", async () => {
    // the main unit test case is in TemplateActions.test.tsx
    const { findByText } = renderWithContext({
      selectedItems: [],
      visible: true,
      onDelete: () => {},
      onClose: () => {},
    });
    await findByText(/The following component template will be permanently deleted/);
    expect(document.body.children).toMatchSnapshot();
  });
});

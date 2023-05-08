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
    renderWithContext({
      selectedItems: [],
      visible: true,
      onDelete: () => {},
      onClose: () => {},
    });
    expect(document.body.children).toMatchSnapshot();
  });
});

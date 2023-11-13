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
import { fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event/dist";
import ISMTemplate from "./ISMTemplate";

describe("<ISMTemplate /> spec", () => {
  it("renders the component", () => {
    const { container } = render(
      <ISMTemplate
        template={{ index_patterns: ["*"], priority: 5 }}
        onUpdateTemplate={() => {}}
        onRemoveTemplate={() => {}}
        isFirst={true}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("calls on remove template when clicking remove button", () => {
    const onRemoveTemplate = jest.fn();
    const { getByTestId } = render(
      <ISMTemplate
        template={{ index_patterns: ["*"], priority: 5 }}
        onUpdateTemplate={() => {}}
        onRemoveTemplate={onRemoveTemplate}
        isFirst={true}
      />
    );
    fireEvent.click(getByTestId("ism-template-remove-button"));
    expect(onRemoveTemplate).toHaveBeenCalled();
  });

  it("calls on update template when typing in priority input", async () => {
    const template = { index_patterns: ["*"], priority: 7 };
    const onUpdateTemplate = jest.fn();
    const { getByTestId } = render(
      <ISMTemplate template={template} onUpdateTemplate={onUpdateTemplate} onRemoveTemplate={() => {}} isFirst={true} />
    );
    fireEvent.focus(getByTestId("ism-template-priority-input"));
    userEvent.type(getByTestId("ism-template-priority-input"), "2");
    fireEvent.blur(getByTestId("ism-template-priority-input"));
    expect(onUpdateTemplate).toHaveBeenCalled();
    expect(onUpdateTemplate).toHaveBeenCalledWith({ ...template, priority: 72 }); // already contains 7, just added 2
  });
});

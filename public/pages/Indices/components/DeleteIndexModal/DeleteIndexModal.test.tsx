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
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteIndexModal from "./DeleteIndexModal";

describe("<DeleteIndexModal /> spec", () => {
  it("renders the component", async () => {
    const { getByText } = render(<DeleteIndexModal selectedItems={[".kibana", "test"]} visible onConfirm={() => {}} onClose={() => {}} />);

    await waitFor(() =>
      expect(getByText("These indexes may contain critical system data. Deleting system indexes may break OpenSearch.")).toBeInTheDocument()
    );
    expect(document.body.children).toMatchSnapshot();
  });

  it("Delete button should be disabled unless a 'delete' was input", async () => {
    const { getByPlaceholderText } = render(
      <DeleteIndexModal selectedItems={[".kibana", "test"]} visible onConfirm={() => {}} onClose={() => {}} />
    );
    expect(document.querySelector(".euiButton--danger")).toHaveAttribute("disabled");
    userEvent.type(getByPlaceholderText("delete"), "delete");
    expect(document.querySelector(".euiButton--danger")).not.toHaveAttribute("disabled");
  });
});

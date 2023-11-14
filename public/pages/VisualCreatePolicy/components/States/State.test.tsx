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
import { screen, render } from "@testing-library/react";
import { fireEvent, waitFor } from "@testing-library/dom";
import State from "./State";
import { State as StateData } from "../../../../../models/interfaces";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { browserServicesMock } from "../../../../../test/mocks";

describe("<State /> spec", () => {
  it("renders the component", () => {
    const state: StateData = {
      name: "some_name",
      actions: [{ close: {} }, { open: {} }, { delete: {} }],
      transitions: [{ state_name: "elsewhere", conditions: {} }],
    };
    const { container } = render(
      <State state={state} isInitialState={true} idx={2} onClickEditState={() => {}} onClickDeleteState={() => {}} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("does not show initial state when it is not the initial state", async () => {
    const state: StateData = {
      name: "some_name",
      actions: [{ close: {} }, { open: {} }, { delete: {} }],
      transitions: [{ state_name: "elsewhere", conditions: {} }],
    };
    render(<State state={state} isInitialState={false} idx={2} onClickEditState={() => {}} onClickDeleteState={() => {}} />);

    await waitFor(() => screen.getByText("some_name", { exact: false }));

    expect(screen.queryByText("Initial state", { exact: false })).toBeNull();
  });

  it("shows no transitions message and no actions message if none defined", async () => {
    const state: StateData = {
      name: "some_name",
      actions: [],
      transitions: [],
    };
    render(<State state={state} isInitialState={false} idx={2} onClickEditState={() => {}} onClickDeleteState={() => {}} />);

    await waitFor(() => screen.getByText("some_name", { exact: false }));

    expect(screen.queryByText("No transitions. Edit state to add transitions.", { exact: false })).not.toBeNull();
    expect(screen.queryByText("No actions. Edit state to add actions.", { exact: false })).not.toBeNull();
  });

  it("renders delete modal when deleting a state", async () => {
    const state: StateData = {
      name: "some_name",
      actions: [{ close: {} }, { open: {} }, { delete: {} }],
      transitions: [{ state_name: "elsewhere", conditions: {} }],
    };
    const onClickDeleteState = jest.fn();
    const { getByTestId } = render(
      <ServicesContext.Provider value={browserServicesMock}>
        <ModalProvider>
          <ServicesConsumer>{(services) => services && <ModalRoot services={services} />}</ServicesConsumer>
          <State state={state} isInitialState={true} idx={2} onClickEditState={() => {}} onClickDeleteState={onClickDeleteState} />
        </ModalProvider>
      </ServicesContext.Provider>
    );

    fireEvent.click(getByTestId("state-delete-button"));

    await waitFor(() => screen.getByText("Deleting the state will result in deleting all transitions.", { exact: false }));

    fireEvent.click(getByTestId("confirmationModalActionButton"));

    expect(onClickDeleteState).toHaveBeenCalled();
  });
});

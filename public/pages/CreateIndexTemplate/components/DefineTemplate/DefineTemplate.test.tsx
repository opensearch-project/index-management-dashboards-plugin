/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { act, render, waitFor } from "@testing-library/react";
import { Route, HashRouter as Router, Switch, Redirect } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import DefineTemplate from "./DefineTemplate";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { ROUTES } from "../../../../utils/constants";
import useField from "../../../../lib/field";
import { FLOW_ENUM, SubDetailProps } from "../../interface";

const WrappedDefineTemplate = (props: Omit<SubDetailProps, "field"> & { onSubmit?: (value: any) => void }) => {
  const field = useField();
  return (
    <>
      <DefineTemplate field={field} {...props} />
      <button
        data-test-subj="submit"
        onClick={async () => {
          const { errors } = await field.validatePromise();
          if (errors) {
            return;
          }
          props.onSubmit?.(field.getValues());
        }}
      >
        submit
      </button>
    </>
  );
};

function renderWithRouter(props: Omit<SubDetailProps, "history" | "field"> & { onSubmit?: (value: any) => void }) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <Router>
            <Switch>
              <Route path={ROUTES.COMPOSABLE_TEMPLATES} render={(routeProps) => <WrappedDefineTemplate {...routeProps} {...props} />} />
              <Redirect from="/" to={ROUTES.COMPOSABLE_TEMPLATES} />
            </Switch>
          </Router>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<ComposableTemplatesActions /> spec", () => {
  beforeEach(() => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (): Promise<any> => {
        return {
          ok: true,
          response: {
            index_templates: [],
          },
        };
      }
    );
  });
  it("renders the component in non-edit mode", async () => {
    const onChangeMock = jest.fn();
    const { container, getByTestId, findByText } = renderWithRouter({
      isEdit: false,
      onSubmit: onChangeMock,
    });
    await waitFor(() => {
      expect(document.querySelector(".euiComboBox__inputWrap-isLoading")).toBeNull();
    });
    expect(container).toMatchSnapshot();
    await userEvent.click(getByTestId("submit"));
    await findByText("Index patterns must be defined");
    await userEvent.click(container.querySelector("#checkboxForIndexTemplateFlowSimple")?.parentNode as Element);
    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect((container.querySelector("#checkboxForIndexTemplateFlowSimple") as HTMLInputElement).checked).toBeTruthy;
      expect(onChangeMock).toBeCalledTimes(0);
    });
    await act(async () => {
      await userEvent.type(getByTestId("form-row-name").querySelector("input") as Element, "1");
      await userEvent.type(getByTestId("form-row-priority").querySelector("input") as Element, "1");
      await userEvent.type(getByTestId("form-row-index_patterns").querySelector("input") as Element, ".kibana*{enter}");
      await userEvent.click(container.querySelector("#checkboxForIndexTemplateFlowComponents") as Element);
      await userEvent.click(getByTestId("submit"));
    });
    await findByText("Index patterns may contain system indexes");
    await waitFor(() => {
      expect(document.querySelector(".euiFormLabel-isInvalid")).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(onChangeMock).toBeCalledWith({
        name: "1",
        index_patterns: [".kibana*"],
        priority: "1",
        _meta: {
          flow: FLOW_ENUM.COMPONENTS,
        },
      });
      expect((container.querySelector("#checkboxForIndexTemplateFlowComponents") as HTMLInputElement).checked).toBeTruthy();
    });
  });

  it("renders the component in edit mode", async () => {
    const onChangeMock = jest.fn();
    const { container } = renderWithRouter({
      isEdit: true,
      onSubmit: onChangeMock,
    });
    await waitFor(() => {
      expect(document.querySelector(".euiComboBox__inputWrap-isLoading")).toBeNull();
    });
    expect(container).toMatchSnapshot();
  });

  it("renders the component in readonly mode", async () => {
    const { container } = renderWithRouter({
      isEdit: true,
      readonly: true,
    });
    expect(container).toMatchSnapshot();
  });
});

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RemoteSelect, { RemoteSelectProps } from "./index";

const onChangeMock = jest.fn();

const AliasSelectWithOnchange = (props: RemoteSelectProps) => {
  const [tempValue, setTempValue] = useState<string[]>(props.value || []);
  return (
    <RemoteSelect
      {...props}
      value={tempValue}
      onChange={(val) => {
        onChangeMock(val);
        setTempValue(val);
      }}
    />
  );
};

describe("<AliasSelect /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<RemoteSelect refreshOptions={() => Promise.resolve({ ok: true, response: [] })} onChange={() => {}} />);
    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  it("renders with error", async () => {
    const { container } = render(
      <RemoteSelect refreshOptions={() => Promise.resolve({ ok: false, error: "error" })} onChange={() => {}} />
    );
    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  it("it should choose options or create one", async () => {
    const { getByTestId } = render(
      <AliasSelectWithOnchange refreshOptions={() => Promise.resolve({ ok: true, response: [{ label: "test" }] })} />
    );
    await waitFor(() => {
      expect(getByTestId("comboBoxInput")).toBeInTheDocument();
    });
    await userEvent.click(getByTestId("comboBoxInput"));
    await waitFor(() => {
      expect(document.querySelector('button[title="test"]')).toBeInTheDocument();
    });
    await userEvent.click(document.querySelector('button[title="test"]') as Element);
    await waitFor(() => {
      expect(onChangeMock).toBeCalledTimes(1);
      expect(onChangeMock).toBeCalledWith(["test"]);
    });
    await userEvent.type(getByTestId("comboBoxInput"), "test2{enter}");
    await waitFor(() => {
      expect(onChangeMock).toBeCalledTimes(2);
      expect(onChangeMock).toBeCalledWith(["test", "test2"]);
    });
    await userEvent.type(getByTestId("comboBoxInput"), "  {enter}");
    await waitFor(() => {
      expect(onChangeMock).toBeCalledTimes(2);
    });
  });
});

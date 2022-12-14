/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { render, waitFor } from "@testing-library/react";
import AliasSelect, { AliasSelectProps } from "./index";
import userEvent from "@testing-library/user-event";

const onChangeMock = jest.fn();

const AliasSelectWithOnchange = (props: AliasSelectProps) => {
  const [tempValue, setTempValue] = useState(props.value);
  return (
    <AliasSelect
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
  it("renders the component and remove duplicate aliases", async () => {
    const onOptionsChange = jest.fn();
    const { container } = render(
      <AliasSelect
        refreshOptions={() =>
          Promise.resolve({
            ok: true,
            response: [
              {
                alias: "a",
                index: "a",
              },
              {
                alias: "a",
                index: "b",
              },
            ],
          })
        }
        onChange={() => {}}
        onOptionsChange={onOptionsChange}
      />
    );
    await waitFor(
      () => {
        expect(onOptionsChange).toBeCalledWith([
          {
            label: "a",
          },
        ]);
        expect(container.firstChild).toMatchSnapshot();
      },
      {
        timeout: 3000,
      }
    );
  });

  it("it should choose options or create one", async () => {
    const { getByTestId } = render(
      <AliasSelectWithOnchange
        refreshOptions={() => Promise.resolve({ ok: true, response: [{ alias: "test", index: "123", query: "test" }] })}
      />
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
      expect(onChangeMock).toBeCalledWith({
        test: {},
      });
    });
    await userEvent.type(getByTestId("comboBoxInput"), "test2{enter}");
    await waitFor(() => {
      expect(onChangeMock).toBeCalledTimes(2);
      expect(onChangeMock).toBeCalledWith({
        test: {},
        test2: {},
      });
    });
    await userEvent.type(getByTestId("comboBoxInput"), "  {enter}");
    await waitFor(() => {
      expect(onChangeMock).toBeCalledTimes(2);
    });
  });
});

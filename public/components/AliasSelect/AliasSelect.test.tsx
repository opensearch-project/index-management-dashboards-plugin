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

import React, { useState } from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AliasSelect, { AliasSelectProps } from "./index";

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

  it("renders with error", async () => {
    const onOptionsChange = jest.fn();
    const { container } = render(
      <AliasSelect
        refreshOptions={() =>
          Promise.resolve({
            ok: false,
            error: "Some error",
          })
        }
        onChange={() => {}}
        onOptionsChange={onOptionsChange}
      />
    );
    await waitFor(() => {});
    expect(container).toMatchSnapshot();
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

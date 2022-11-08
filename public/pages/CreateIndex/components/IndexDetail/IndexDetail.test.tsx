/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, forwardRef, useState } from "react";
import { render, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import IndexDetail, { IIndexDetailRef, IndexDetailProps } from "./IndexDetail";
import userEvent from "@testing-library/user-event";

const IndexDetailOnChangeWrapper = forwardRef((props: Omit<IndexDetailProps, "onChange">, ref: any) => {
  const [value, setValue] = useState(props.value as any);
  return (
    <IndexDetail
      {...props}
      ref={ref}
      value={value}
      onChange={(val) => {
        setValue(val);
      }}
    />
  );
});

const refreshOptions: () => Promise<{ ok: true; response: any[] }> = () => Promise.resolve({ ok: true, response: [{ alias: "test" }] });

describe("<IndexDetail /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<IndexDetail refreshOptions={refreshOptions} onChange={() => {}} />);
    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  it("disallows editing index name when in edit mode", async () => {
    const { getByDisplayValue } = render(
      <IndexDetail refreshOptions={refreshOptions} value={{ index: "some_index" }} isEdit onChange={() => {}} />
    );

    await waitFor(() => getByDisplayValue("some_index"));

    expect(getByDisplayValue("some_index")).toHaveAttribute("disabled");
  });

  it("disallows editing number_of_replicas when in edit mode", async () => {
    const { getByPlaceholderText } = render(
      <IndexDetail refreshOptions={refreshOptions} value={{ index: "some_index" }} isEdit onChange={() => {}} />
    );

    await waitFor(() => getByPlaceholderText("The number of primary shards in the index. Default is 1."));

    expect(getByPlaceholderText("The number of primary shards in the index. Default is 1.")).toHaveAttribute("disabled");
  });

  it("validate should say error when field name is required", async () => {
    const { result } = renderHook(() => {
      const ref = useRef<IIndexDetailRef>(null);
      const container = render(<IndexDetailOnChangeWrapper refreshOptions={refreshOptions} ref={ref} />);
      return {
        ref,
        container,
      };
    });
    await waitFor(async () => {
      expect(await result.current.ref.current?.validate()).toBe(false);
    });
    const ref = result.current.ref;
    const { getByTestId, getByPlaceholderText } = result.current.container;
    userEvent.type(getByPlaceholderText("Please enter the name for your index"), "good_index");
    await waitFor(async () => {
      expect(await ref.current?.validate()).toBe(false);
    });
    userEvent.type(getByTestId("form-name-index.number_of_shards").querySelector("input") as Element, "2");
    userEvent.type(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element, "2");
    await waitFor(async () => {
      expect(await ref.current?.validate()).toBe(true);
    });
  });

  it("inherit templates settings when create", async () => {
    const { getByDisplayValue, getByPlaceholderText, getByText, getByTestId } = render(
      <IndexDetailOnChangeWrapper
        refreshOptions={refreshOptions}
        value={{ index: "some_index" }}
        onSimulateIndexTemplate={() =>
          Promise.resolve({
            ok: true,
            response: {
              index: "some_index",
              aliases: {
                test: {},
              },
              settings: {
                "index.number_of_replicas": 2,
              },
            },
          })
        }
      />
    );
    await waitFor(() => getByDisplayValue("some_index"));
    userEvent.click(getByDisplayValue("some_index"));
    userEvent.click(document.body);
    await waitFor(() => {
      expect(document.querySelector('[data-test-subj="comboBoxInput"] [title="test"]')).not.toBeNull();
    });
    userEvent.type(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element, "10");
    userEvent.click(getByDisplayValue("some_index"));
    userEvent.click(document.body);
    // The Dialog should show
    await waitFor(() => {
      expect(getByText("The index name has matched one or more index templates, please choose which way to go on")).toBeInTheDocument();
    });
    userEvent.click(getByTestId("simulate-confirm-confirm"));
    await waitFor(() => {
      expect(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element).toHaveAttribute("value", "2");
    });

    userEvent.clear(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element);
    userEvent.type(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element, "10");
    userEvent.click(getByDisplayValue("some_index"));
    userEvent.click(document.body);
    // The Dialog should show
    await waitFor(() => {
      expect(getByText("The index name has matched one or more index templates, please choose which way to go on")).toBeInTheDocument();
    });
    userEvent.click(getByTestId("simulate-confirm-cancel"));
    await waitFor(() => {
      expect(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element).toHaveAttribute("value", "10");
    });
  });
});

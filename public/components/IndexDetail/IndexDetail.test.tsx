/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, forwardRef, useState } from "react";
import { render, waitFor, renderHook } from "@testing-library/react";
import IndexDetail, { IIndexDetailRef, IndexDetailProps } from "./IndexDetail";
import userEventModule from "@testing-library/user-event";

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
  const userEvent = userEventModule.setup();

  it("renders the component", async () => {
    const { container } = render(<IndexDetail docVersion="latest" refreshOptions={refreshOptions} onChange={() => {}} />);
    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  it("disallows editing index name when in edit mode", async () => {
    const { getByTestId } = render(
      <IndexDetail docVersion="latest" refreshOptions={refreshOptions} value={{ index: "some_index" }} isEdit onChange={() => {}} />
    );

    await waitFor(() => expect(getByTestId("form-name-index").querySelector('[title="some_index"]')).toBeInTheDocument());
  });

  it("disallows editing number_of_replicas when in edit mode", async () => {
    const { getByTestId } = render(
      <IndexDetail docVersion="latest" refreshOptions={refreshOptions} value={{ index: "some_index" }} isEdit onChange={() => {}} />
    );

    await waitFor(() => expect(getByTestId("form-name-index.number_of_shards").querySelector(".euiText")).toHaveAttribute("title", "-"));
  });

  it("validate should say error when field name is required", async () => {
    const { result } = renderHook(() => {
      const ref = useRef<IIndexDetailRef>(null);
      const container = render(<IndexDetailOnChangeWrapper docVersion="latest" refreshOptions={refreshOptions} ref={ref} />);
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
    await userEvent.type(getByPlaceholderText("Specify a name for the new index."), "good_index");
    await waitFor(async () => {
      expect(await ref.current?.validate()).toBe(false);
    });
    await userEvent.type(getByTestId("form-name-index.number_of_shards").querySelector("input") as Element, "2");
    await userEvent.type(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element, "2");
    await waitFor(async () => {
      expect(await ref.current?.validate()).toBe(true);
    });
  });

  it("inherit templates settings when create", async () => {
    const { findByDisplayValue, getByDisplayValue, getByText, getByTestId, queryByText } = render(
      <IndexDetailOnChangeWrapper
        docVersion="latest"
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
    await findByDisplayValue("some_index");
    await userEvent.click(getByDisplayValue("some_index"));
    await userEvent.click(document.body);
    await waitFor(() => {
      expect(document.querySelector('[data-test-subj="comboBoxInput"] [title="test"]')).not.toBeNull();
    });
    await userEvent.type(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element, "10");
    await userEvent.click(getByDisplayValue("some_index"));
    await userEvent.click(document.body);
    // The Dialog should show
    await waitFor(() => {
      expect(
        getByText(
          "The index name matches one or more index templates. Index aliases, settings, and mappings are inherited from matching templates. Do you want to merge your changes with templates?"
        )
      ).toBeInTheDocument();
    });
    await userEvent.click(getByTestId("simulate-confirm-confirm"));
    await waitFor(() => {
      expect(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element).toHaveAttribute("value", "2");
      expect(queryByText("The index name matches one or more index templates")).toBeInTheDocument();
    });

    await userEvent.clear(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element);
    await userEvent.type(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element, "10");
    await userEvent.click(getByDisplayValue("some_index"));
    await userEvent.click(document.body);
    // The Dialog should show
    await waitFor(() => {
      expect(
        getByText(
          "The index name matches one or more index templates. Index aliases, settings, and mappings are inherited from matching templates. Do you want to merge your changes with templates?"
        )
      ).toBeInTheDocument();
    });
    await userEvent.click(getByTestId("simulate-confirm-cancel"));
    await waitFor(() => {
      expect(getByTestId("form-name-index.number_of_replicas").querySelector("input") as Element).toHaveAttribute("value", "2");
    });
  });
});

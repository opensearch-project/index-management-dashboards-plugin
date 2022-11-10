/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, Ref, useRef, useState } from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IndexMapping, { IIndexMappingsRef, IndexMappingProps, transformObjectToArray } from "./IndexMapping";
import { MappingsProperties } from "../../../../../models/interfaces";
import { renderHook } from "@testing-library/react-hooks";

const IndexMappingOnChangeWrapper = forwardRef((props: Partial<IndexMappingProps>, ref: Ref<IIndexMappingsRef>) => {
  const [value, setValue] = useState(props.value as any);
  return (
    <IndexMapping
      {...props}
      ref={ref}
      value={value}
      onChange={(val) => {
        setValue(val);
      }}
    />
  );
});

describe("<IndexMapping /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<IndexMapping onChange={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("render mappings with object type", () => {
    const { container } = render(
      <IndexMapping
        onChange={() => {}}
        value={[{ fieldName: "object", type: "object", properties: [{ fieldName: "text", type: "text" }] }]}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it("render mappings with oldValue in edit mode and all operation works well", async () => {
    const { result } = renderHook(() => {
      const ref = useRef<IIndexMappingsRef>(null);
      const renderResult = render(
        <IndexMappingOnChangeWrapper
          ref={ref}
          isEdit
          oldValue={[{ fieldName: "object", type: "object", properties: [{ fieldName: "text", type: "text" }] }]}
          value={[{ fieldName: "object", type: "object", properties: [{ fieldName: "text", type: "text" }] }]}
        />
      );

      return {
        renderResult,
        ref,
      };
    });
    const { renderResult, ref } = result.current;
    const { getByTestId, getByText, queryByTestId, queryByText } = renderResult;

    // old field disable check
    expect(getByTestId("mapping-visual-editor-0-field-name")).toHaveAttribute("disabled");
    expect(getByTestId("mapping-visual-editor-0.properties.0-field-name")).toHaveAttribute("disabled");
    expect(document.querySelector('[data-test-subj="mapping-visual-editor-0-delete-field"]')).toBeNull();
    expect(document.querySelector('[data-test-subj="mapping-visual-editor-0.properties.0-add-sub-field"]')).toBeNull();
    expect(document.querySelector('[data-test-subj="mapping-visual-editor-0.properties.0-delete-field"]')).toBeNull();

    // add a new field
    userEvent.click(getByTestId("create index add field button"));
    // new field should be editable
    expect(getByTestId("mapping-visual-editor-1-field-name")).not.toHaveAttribute("disabled");
    expect(document.querySelector('[data-test-subj="mapping-visual-editor-1-delete-field"]')).not.toBeNull();

    // empty and duplicate validation for field name
    userEvent.click(document.querySelector('[data-test-subj="mapping-visual-editor-1-field-name"]') as Element);
    expect(getByTestId("mapping-visual-editor-1-field-name")).toHaveValue("");
    expect(queryByText("Field name is required, please input")).toBeNull();
    userEvent.click(document.body);
    expect(getByText("Field name is required, please input")).not.toBeNull();
    userEvent.type(getByTestId("mapping-visual-editor-1-field-name"), "object");
    userEvent.click(document.body);
    expect(getByText("Duplicate field name [object], please change your field name")).not.toBeNull();
    await act(async () => {
      expect(await ref.current?.validate()).toEqual("with error");
    });
    userEvent.clear(getByTestId("mapping-visual-editor-1-field-name"));
    userEvent.type(getByTestId("mapping-visual-editor-1-field-name"), "new_object");
    await act(async () => {
      expect(await ref.current?.validate()).toEqual("");
    });
    expect(queryByText("Duplicate field name [object], please change your field name")).toBeNull();
    userEvent.click(document.body);

    // only show the sub action for type of object
    expect(queryByTestId("mapping-visual-editor-1-add-sub-field")).toBeNull();

    // change type to object
    fireEvent.change(getByTestId("mapping-visual-editor-1-field-type"), {
      target: {
        value: "object",
      },
    });

    // sub action for object
    expect(getByTestId("mapping-visual-editor-1-add-sub-field")).not.toBeNull();
    userEvent.click(getByTestId("mapping-visual-editor-1-add-sub-field"));
    // new sub field check
    expect((getByTestId("mapping-visual-editor-1.properties.0-field-type") as HTMLSelectElement).value).toBe("text");
    await waitFor(() => {
      userEvent.click(getByTestId("mapping-visual-editor-1.properties.0-delete-field"));
    });

    // add a new field
    userEvent.click(getByTestId("create index add field button"));
    // delete the new field
    await waitFor(() => {});
    userEvent.click(getByTestId("mapping-visual-editor-2-delete-field"));
    expect(queryByTestId("mapping-visual-editor-2-delete-field")).toBeNull();

    await userEvent.click(getByTestId("editor-type-json-editor").querySelector("input") as Element);
    await waitFor(() => {});
    userEvent.click(getByTestId("previous-mappings-json-button"));
    await waitFor(() => {});
    expect(queryByTestId("previous-mappings-json-modal-ok")).not.toBeNull();
    userEvent.click(getByTestId("previous-mappings-json-modal-ok"));
    await waitFor(() => {
      expect(queryByTestId("previous-mappings-json-modal-ok")).toBeNull();
    });
  });

  it("it transformObjectToArray", () => {
    expect(
      transformObjectToArray({
        test: {
          type: "text",
          properties: {
            test_children: {
              type: "text",
            },
          },
        },
      })
    ).toEqual([
      {
        fieldName: "test",
        type: "text",
        properties: [
          {
            fieldName: "test_children",
            type: "text",
          },
        ],
      },
    ] as MappingsProperties);
  });
});

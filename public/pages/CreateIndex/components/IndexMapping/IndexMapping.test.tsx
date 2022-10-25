/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IndexMapping, { IndexMappingProps } from "./IndexMapping";

const IndexMappingOnChangeWrapper = (props: Partial<IndexMappingProps>) => {
  const [value, setValue] = useState(props.value as any);
  return (
    <IndexMapping
      {...props}
      value={value}
      onChange={(val) => {
        setValue(val);
        console.error("val", val);
      }}
    />
  );
};

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
    const { getByTestId, getByText, findByTestId, queryByTestId } = render(
      <IndexMappingOnChangeWrapper
        isEdit
        oldValue={[{ fieldName: "object", type: "object", properties: [{ fieldName: "text", type: "text" }] }]}
        value={[{ fieldName: "object", type: "object", properties: [{ fieldName: "text", type: "text" }] }]}
      />
    );

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
    userEvent.click(document.body);
    expect(getByText("Field name is required, please input")).not.toBeNull();
    userEvent.type(getByTestId("mapping-visual-editor-1-field-name"), "object");
    userEvent.click(document.body);
    expect(getByText("Duplicate field name [object], please change your field name")).not.toBeNull();
    userEvent.type(getByTestId("mapping-visual-editor-1-field-name"), "new_object");

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
  });
});

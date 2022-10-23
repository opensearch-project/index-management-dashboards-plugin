/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from "react";
import { render, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import IndexDetail, { IIndexDetailRef } from "./IndexDetail";

const timeOut = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

describe("<IndexDetail /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<IndexDetail onChange={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("disallows editing index name when in edit mode", async () => {
    const { getByDisplayValue } = render(<IndexDetail value={{ index: "some_index" }} isEdit onChange={() => {}} />);

    await waitFor(() => getByDisplayValue("some_index"));

    expect(getByDisplayValue("some_index")).toHaveAttribute("disabled");
  });

  it("disallows editing number_of_replicas when in edit mode", async () => {
    const { getByPlaceholderText } = render(<IndexDetail value={{ index: "some_index" }} isEdit onChange={() => {}} />);

    await waitFor(() => getByPlaceholderText("The number of replica shards each primary shard should have."));

    expect(getByPlaceholderText("The number of replica shards each primary shard should have.")).toHaveAttribute("disabled");
  });

  it("validate should say error when the field name is required", async () => {
    const { result } = renderHook(() => {
      const ref = useRef<IIndexDetailRef>(null);
      const [validate, setValidate] = useState(true);
      useEffect(() => {
        ref.current?.validate().then((flag) => setValidate(flag));
      }, []);
      render(<IndexDetail ref={ref} value={{ index: "" }} onChange={() => {}} />);
      return {
        validate,
      };
    });

    await timeOut(1000);
    expect(result.current.validate).toBe(false);
  });
});

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, waitFor } from "@testing-library/react";
import React from "react";
import ForceMergeAdvancedOptions, { ForceMergeOptionsProps } from "./ForceMergeAdvancedOptions";
import useField from "../../../../lib/field";

const WrappedComponent = (props: Partial<ForceMergeOptionsProps>) => {
  const field = useField();
  return <ForceMergeAdvancedOptions {...props} field={field} />;
};

describe("<ForceMergeAdvancedOptions /> spec", () => {
  it("renders the component", async () => {
    const component = render(<WrappedComponent />);
    // wait for one tick
    await waitFor(() => {});
    expect(component).toMatchSnapshot();
  });
});

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import DescriptionListHoz from "./DescriptionListHoz";

describe("<DescriptionListHoz /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<DescriptionListHoz listItems={[{ title: "test", description: "test description" }]} />);
    expect(container).toMatchSnapshot();
  });
});

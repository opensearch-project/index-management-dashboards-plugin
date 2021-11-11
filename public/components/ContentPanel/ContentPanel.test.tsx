/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render } from "@testing-library/react";
import ContentPanel from "./ContentPanel";

describe("<ContentPanel /> spec", () => {
  it("renders the component", () => {
    const { container } = render(
      <ContentPanel title="Testing" actions={[<div>one</div>, <div>two</div>]}>
        <div>Testing ContentPanel</div>
      </ContentPanel>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders actions", () => {
    const { getByText } = render(
      <ContentPanel title="Testing" actions={[<div>one</div>, <div>two</div>]}>
        <div>Testing ContentPanel</div>
      </ContentPanel>
    );
    getByText("one");
    getByText("two");
  });
});

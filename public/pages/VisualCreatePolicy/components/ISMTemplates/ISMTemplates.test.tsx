/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import ISMTemplates from "./ISMTemplates";
import { DEFAULT_POLICY } from "../../utils/constants";

describe("<ISMTemplates /> spec", () => {
  it("renders the component", () => {
    const { container } = render(<ISMTemplates policy={DEFAULT_POLICY} onChangePolicy={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

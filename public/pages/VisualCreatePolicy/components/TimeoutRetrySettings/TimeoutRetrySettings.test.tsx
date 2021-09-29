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
import TimeoutRetrySettings from "./TimeoutRetrySettings";
import { RolloverUIAction } from "../UIActions";
import { DEFAULT_ROLLOVER } from "../../utils/constants";
import { UIAction } from "../../../../../models/interfaces";

describe("<TimeoutRetrySettings /> spec", () => {
  it("renders the component", () => {
    const action: UIAction<any> = new RolloverUIAction(DEFAULT_ROLLOVER, "abc-123-id");
    const { container } = render(<TimeoutRetrySettings action={action} editAction={true} onChangeAction={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

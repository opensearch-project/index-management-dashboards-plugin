/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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

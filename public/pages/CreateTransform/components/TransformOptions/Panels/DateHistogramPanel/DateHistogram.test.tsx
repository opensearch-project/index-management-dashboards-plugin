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
import { render, fireEvent } from "@testing-library/react";
import DateHistogramPanel from "./DateHistogramPanel";
import { IntervalType } from "../../../../../../utils/constants";

describe("<DateHistogramPanel /> spec", () => {
  it("renders the component with fixed interval", async () => {
    const { container } = render(
      <DateHistogramPanel
        name="test"
        handleGroupSelectionChange={() => {}}
        aggList={[]}
        closePopover={() => {}}
        intervalType={IntervalType.FIXED}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
  it("renders the component with calendar interval", async () => {
    const { container } = render(
      <DateHistogramPanel
        name="test"
        handleGroupSelectionChange={() => {}}
        aggList={[]}
        closePopover={() => {}}
        intervalType={IntervalType.CALENDAR}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("calls closePopover when clicking cancel button", async () => {
    const closePopover = jest.fn();
    const { getByTestId } = render(
      <DateHistogramPanel
        name="test"
        handleGroupSelectionChange={() => {}}
        aggList={[]}
        closePopover={closePopover}
        intervalType={IntervalType.FIXED}
      />
    );

    await fireEvent.click(getByTestId("dateHistogramPanelCancelButton"));

    expect(closePopover).toHaveBeenCalledTimes(1);
  });
});

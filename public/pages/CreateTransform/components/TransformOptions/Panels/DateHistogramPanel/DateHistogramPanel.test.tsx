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
import { GROUP_TYPES, TRANSFORM_AGG_TYPE } from "../../../../../../../models/interfaces";

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

    fireEvent.click(getByTestId("dateHistogramPanelCancelButton"));

    expect(closePopover).toHaveBeenCalledTimes(1);
  });

  it("uses interval 1 when defined by calendar interval", async () => {
    const handleGroupSelectionChange = jest.fn();
    const name = "test";
    const intervalType = IntervalType.CALENDAR;
    const targetFieldName = `${name} _${GROUP_TYPES.dateHistogram}_1_y_${IntervalType.CALENDAR}`;
    const expectedGroupItem = {
      date_histogram: {
        source_field: name,
        target_field: targetFieldName,
        calendar_interval: "1y",
      },
    };
    const { queryByText, getByTestId } = render(
      <DateHistogramPanel
        name={name}
        handleGroupSelectionChange={handleGroupSelectionChange}
        aggList={[]}
        closePopover={() => {}}
        intervalType={intervalType}
      />
    );

    // Shows the "Every 1" text
    expect(queryByText("Every 1")).not.toBeNull();

    fireEvent.change(getByTestId("dateHistogramTimeunitSelect"), { target: { value: "y" } });

    fireEvent.click(getByTestId("dateHistogramPanelOKButton"));

    expect(handleGroupSelectionChange).toHaveBeenCalledWith(expectedGroupItem, TRANSFORM_AGG_TYPE.date_histogram, targetFieldName);
  });

  it("uses correct interval when defined by fixed interval", async () => {
    const handleGroupSelectionChange = jest.fn();
    const name = "test";
    const intervalType = IntervalType.FIXED;
    const intervalValue = 234;
    const targetFieldName = `${name} _${GROUP_TYPES.dateHistogram}_234_s_${IntervalType.FIXED}`;
    const expectedGroupItem = {
      date_histogram: {
        source_field: name,
        target_field: targetFieldName,
        fixed_interval: "234s",
      },
    };
    const { getByTestId } = render(
      <DateHistogramPanel
        name={name}
        handleGroupSelectionChange={handleGroupSelectionChange}
        aggList={[]}
        closePopover={() => {}}
        intervalType={intervalType}
      />
    );

    fireEvent.change(getByTestId("dateHistogramValueInput"), { target: { value: intervalValue } });

    fireEvent.change(getByTestId("dateHistogramTimeunitSelect"), { target: { value: "s" } });

    fireEvent.click(getByTestId("dateHistogramPanelOKButton"));

    expect(handleGroupSelectionChange).toHaveBeenCalledWith(expectedGroupItem, TRANSFORM_AGG_TYPE.date_histogram, targetFieldName);
  });
});

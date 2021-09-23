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

/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import ManagedIndexEmptyPrompt, { TEXT } from "./ManagedIndexEmptyPrompt";

describe("<ManagedIndexEmptyPrompt /> spec", () => {
  it("renders the component", async () => {
    const { container } = render(<ManagedIndexEmptyPrompt filterIsApplied={false} loading={false} resetFilters={() => {}} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders no managed indices by default", async () => {
    const { getByText, queryByTestId } = render(
      <ManagedIndexEmptyPrompt filterIsApplied={false} loading={false} resetFilters={() => {}} />
    );

    getByText(TEXT.NO_MANAGED_INDICES);
    expect(queryByTestId("managedIndexEmptyPromptResetFilters")).toBeNull();
  });

  it("shows LOADING", async () => {
    const { getByText, queryByTestId } = render(<ManagedIndexEmptyPrompt filterIsApplied={true} loading={true} resetFilters={() => {}} />);

    getByText(TEXT.LOADING);
    expect(queryByTestId("managedIndexEmptyPromptResetFilters")).toBeNull();
  });

  it("shows reset filters", async () => {
    const resetFilters = jest.fn();
    const { getByText, getByTestId } = render(
      <ManagedIndexEmptyPrompt filterIsApplied={true} loading={false} resetFilters={resetFilters} />
    );

    getByText(TEXT.RESET_FILTERS);
    fireEvent.click(getByTestId("managedIndexEmptyPromptResetFilters"));
    expect(resetFilters).toHaveBeenCalledTimes(1);
  });
});

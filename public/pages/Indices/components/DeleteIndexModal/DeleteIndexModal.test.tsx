/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import ApplyPolicyModal from "./DeleteIndexModal";
import { httpClientMock } from "../../../../../test/mocks";

describe("<DeleteIndexModal /> spec", () => {
  it("renders the component", async () => {
    httpClientMock.post = jest.fn().mockResolvedValue({ ok: true, response: { policies: [{ policy: "some_policy", id: "some_id" }] } });
    const { container } = render(<ApplyPolicyModal selectedItems={[]} visible onConfirm={() => {}} onClose={() => {}} />);

    expect(container).toMatchSnapshot();
  });
});

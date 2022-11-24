/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { SimpleEuiToast } from "./index";

describe("SimpleEuiToast show", () => {
  it("render the component", async () => {
    await act(async () => {
      SimpleEuiToast.addSuccess("Success information");
    });
    expect(document.body).toMatchSnapshot();
    expect(document.querySelector('[data-test-subj="toast_Success information"]')).not.toBeNull();
    await act(async () => {
      SimpleEuiToast.addDanger("Error information");
    });
    expect(document.querySelector('[data-test-subj="toast_Error information"]')).not.toBeNull();
    await act(async () => {
      SimpleEuiToast.show({
        toastLifeTimeMs: 10,
        title: "Test quick destroy",
      });
    });
    await waitFor(() => {
      expect(document.querySelector('[data-test-subj="toast_Test quick destroy"]')).toBeNull();
    });
  });
});

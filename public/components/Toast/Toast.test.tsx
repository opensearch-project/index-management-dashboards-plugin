/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

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

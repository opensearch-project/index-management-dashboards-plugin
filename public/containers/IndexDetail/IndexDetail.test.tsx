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

import React from "react";
import { render, waitFor } from "@testing-library/react";
import IndexDetail, { IIndexDetailProps } from "./index";
import { browserServicesMock, coreServicesMock } from "../../../test/mocks";
import { ServicesContext } from "../../services";
import { CoreServicesContext } from "../../components/core_services";
import { CatIndex } from "../../../server/models/interfaces";

browserServicesMock.commonService.apiCaller = jest.fn(
  async (payload): Promise<any> => {
    if (payload.data?.index?.includes("error_index")) {
      return {
        ok: false,
        error: "error index",
      };
    }

    return {
      ok: true,
      response: (payload.data.index || []).map(
        (index: string): CatIndex => {
          return {
            index,
            "docs.count": "0",
            "docs.deleted": "1",
            "pri.store.size": "1",
            data_stream: "no",
            "store.size": "1mb",
            rep: "2",
            uuid: "1",
            health: "green",
            pri: "4",
            status: "open",
          };
        }
      ),
    };
  }
);

function renderWithServiceAndCore(props: IIndexDetailProps) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <IndexDetail {...props} />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<IndexDetail /> spec", () => {
  it("render the component", async () => {
    const { container, queryByText } = renderWithServiceAndCore({
      indices: ["test"],
      children: <>content underneath the table</>,
    });

    expect(queryByText("children content here")).toBeNull();
    await waitFor(() => {
      expect(container).toMatchSnapshot();
      expect(browserServicesMock.commonService.apiCaller).toBeCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "cat.indices",
        data: {
          index: ["test"],
          format: "json",
        },
      });
    });
    expect(queryByText("content underneath the table")).not.toBeNull();
  });

  it("render with error", async () => {
    const onGetIndicesDetailMock = jest.fn();
    renderWithServiceAndCore({
      indices: ["error_index"],
      children: <>content underneath the table</>,
      onGetIndicesDetail: onGetIndicesDetailMock,
    });

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledWith("error index");
      expect(onGetIndicesDetailMock).toBeCalledTimes(1);
      expect(onGetIndicesDetailMock).toBeCalledWith([]);
    });
  });
});

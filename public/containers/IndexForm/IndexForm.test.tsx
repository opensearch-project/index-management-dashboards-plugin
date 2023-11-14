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

import React, { useState } from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IndexForm, { IndexFormProps } from "./index";
import { ServicesContext } from "../../services";
import { browserServicesMock, coreServicesMock, apiCallerMock } from "../../../test/mocks";
import { IndicesUpdateMode } from "../../utils/constants";
import { CoreServicesContext } from "../../components/core_services";

function IndexFormWrapper(props: Omit<IndexFormProps, "onChange">) {
  const [value, onChange] = useState(props.value || {});
  return <IndexForm {...props} value={value} onChange={(val) => onChange(val || {})} />;
}

function renderCreateIndexWithRouter(props: Omit<IndexFormProps, "onChange">) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <IndexFormWrapper {...props} />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<IndexForm /> spec", () => {
  beforeEach(() => {
    apiCallerMock(browserServicesMock);
  });
  it("render page", async () => {
    const { findByText, container } = renderCreateIndexWithRouter({});

    await findByText("Number of primary shards");

    await waitFor(
      () => expect((document.querySelector("#accordionForCreateIndexSettings") as HTMLDivElement).style.height).toEqual("0px"),
      {
        timeout: 3000,
      }
    );

    expect(container).toMatchSnapshot();
  });
});
